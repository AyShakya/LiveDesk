import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocument, persistDocumentOnExit } from "../api/documents";
import type { Document } from "../types/document";
import {
  connectWebSocket,
  sendMessage,
  disconnectWebSocket,
} from "../ws/client";
import type { PresenceUser, WSMessage } from "../types/ws";
import {
  applyDiffOperations,
  getDiffOperations,
  type DiffOperation,
} from "../utils/diff";
import { EditorSkeleton } from "../components/ui/Skeleton";

function getSelectionAfterOperations(
  cursorPos: number,
  operations: DiffOperation[],
) {
  return operations.reduce((nextCursor, operation) => {
    if (operation.index >= nextCursor) {
      return nextCursor;
    }

    if (operation.type === "insert") {
      return nextCursor + operation.text.length;
    }

    if (operation.type === "delete") {
      const deletionEnd = operation.index + operation.length;
      if (deletionEnd <= nextCursor) {
        return Math.max(operation.index, nextCursor - operation.length);
      }

      return operation.index;
    }

    const replacedEnd = operation.index + operation.length;

    if (replacedEnd <= nextCursor) {
      return operation.index + operation.text.length + (nextCursor - replacedEnd);
    }

    return operation.index + operation.text.length;
  }, cursorPos);
}

function formatLastChange(timestamp: number | null) {
  if (!timestamp) {
    return "Waiting for your first edit";
  }

  const secondsAgo = Math.max(0, Math.round((Date.now() - timestamp) / 1000));

  if (secondsAgo < 5) {
    return "Updated just now";
  }

  if (secondsAgo < 60) {
    return `Updated ${secondsAgo}s ago`;
  }

  const minutesAgo = Math.round(secondsAgo / 60);
  return `Updated ${minutesAgo}m ago`;
}

function rebaseDraftOntoContent(
  baseContent: string,
  draftContent: string,
  nextBaseContent: string,
) {
  const draftOperations = getDiffOperations(baseContent, draftContent);

  if (draftOperations.length === 0) {
    return nextBaseContent;
  }

  return applyDiffOperations(nextBaseContent, draftOperations);
}

function applyMarkdownWrap(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix = prefix,
) {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const nextValue =
    value.slice(0, selectionStart) +
    prefix +
    selectedText +
    suffix +
    value.slice(selectionEnd);
  const cursorStart = selectionStart + prefix.length;
  const cursorEnd = cursorStart + selectedText.length;

  return {
    nextValue,
    selectionStart: cursorStart,
    selectionEnd: cursorEnd,
  };
}

function applyHeading(value: string, selectionStart: number, selectionEnd: number) {
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEndIndex = value.indexOf("\n", selectionEnd);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const line = value.slice(lineStart, lineEnd);
  const trimmedLine = line.replace(/^#\s+/, "");
  const nextLine = `# ${trimmedLine}`;
  const nextValue = value.slice(0, lineStart) + nextLine + value.slice(lineEnd);

  return {
    nextValue,
    selectionStart: lineStart + 2,
    selectionEnd: lineStart + nextLine.length,
  };
}

export default function DocumentEditor() {
  const { id, docId } = useParams<{ id: string; docId: string }>();

  const [docRecord, setDocRecord] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [syncState, setSyncState] = useState<"ready" | "live" | "offline">(
    "ready",
  );
  const [lastVisibleEditAt, setLastVisibleEditAt] = useState<number | null>(null);

  const lastSentRef = useRef(0);
  const throttleInterval = 20;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const contentRef = useRef("");
  const wsStatusRef = useRef<"connecting" | "connected" | "disconnected">(
    "connecting",
  );
  const flushTimeoutRef = useRef<number | null>(null);
  const queuedValueRef = useRef<string | null>(null);
  const saveOnExitRef = useRef<string | null>(null);

  function setEditorValue(nextValue: string) {
    const editor = textareaRef.current;

    if (editor && editor.value !== nextValue) {
      editor.value = nextValue;
    }
  }

  function hasQueuedChanges() {
    return queuedValueRef.current !== null;
  }

  useEffect(() => {
    wsStatusRef.current = wsStatus;
  }, [wsStatus]);

  useEffect(() => {
    if (!docId) return;

    let isCancelled = false;

    setLoading(true);
    setDocRecord(null);
    setOnlineUsers([]);
    setLastVisibleEditAt(null);
    contentRef.current = "";
    saveOnExitRef.current = null;
    queuedValueRef.current = null;
    setEditorValue("");

    async function load() {
      try {
        const data = await getDocument(docId as string);

        if (isCancelled) return;

        setDocRecord(data);
        contentRef.current = data.content;
        saveOnExitRef.current = data.content;
        queuedValueRef.current = null;
        setEditorValue(data.content);
        setLastVisibleEditAt(data.content ? Date.now() : null);
      } catch (error) {
        if (isCancelled) return;
        console.error("Failed to load document", error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, [docId]);

  useEffect(() => {
    if (!id || !docId) return;

    const token = localStorage.getItem("token");
    const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}&workspaceId=${id}&docId=${docId}`;

    connectWebSocket(
      wsUrl,
      (message: WSMessage) => {
        if (message.type === "DOC_SYNC" || message.type === "DOC_UPDATED") {
          const previousBaseContent = contentRef.current;
          const nextBaseContent =
            message.type === "DOC_SYNC"
              ? message.content
              : message.content ??
                applyDiffOperations(previousBaseContent, message.operations);
          const editor = textareaRef.current;
          const visibleContent =
            queuedValueRef.current ?? editor?.value ?? previousBaseContent;
          const nextVisibleContent = hasQueuedChanges()
            ? rebaseDraftOntoContent(
                previousBaseContent,
                visibleContent,
                nextBaseContent,
              )
            : nextBaseContent;
          const visibleAdjustmentOperations = hasQueuedChanges()
            ? getDiffOperations(visibleContent, nextVisibleContent)
            : message.type === "DOC_UPDATED"
              ? message.operations
              : getDiffOperations(visibleContent, nextBaseContent);

          const selectionStart = editor?.selectionStart ?? nextVisibleContent.length;
          const nextSelectionStart = getSelectionAfterOperations(
            selectionStart,
            visibleAdjustmentOperations,
          );

          contentRef.current = nextBaseContent;
          saveOnExitRef.current = hasQueuedChanges()
            ? nextVisibleContent
            : nextBaseContent;
          setEditorValue(nextVisibleContent);

          if (hasQueuedChanges()) {
            queuedValueRef.current = nextVisibleContent;
          }

          setLastVisibleEditAt(Date.now());
          setSyncState(wsStatusRef.current === "connected" ? "live" : "offline");

          requestAnimationFrame(() => {
            if (editor) {
              editor.selectionStart = nextSelectionStart;
              editor.selectionEnd = nextSelectionStart;
            }
          });
          return;
        }

        if (message.type === "PRESENCE_UPDATE") {
          setOnlineUsers(message.users || []);
        }
      },
      (status) => {
        setWsStatus(status);
        setSyncState((currentState) => {
          if (status === "disconnected") {
            return "offline";
          }

          if (status === "connected") {
            return currentState === "ready" && !hasQueuedChanges() ? "ready" : "live";
          }

          return currentState;
        });
      },
    );

    return () => {
      disconnectWebSocket();

      if (flushTimeoutRef.current) {
        window.clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }

      setWsStatus("disconnected");
      setSyncState("offline");
    };
  }, [id, docId]);

  useEffect(() => {
    if (!docId) {
      return;
    }

    function saveLatestDocument() {
      const latestValue = queuedValueRef.current ?? textareaRef.current?.value ?? saveOnExitRef.current;

      if (latestValue === null || latestValue === contentRef.current) {
        return;
      }

      saveOnExitRef.current = latestValue;
      persistDocumentOnExit(docId as string, latestValue);
    }

    const handleBeforeUnload = () => {
      saveLatestDocument();
    };

    const handleVisibilityChange = () => {
      if (window.document.visibilityState === "hidden") {
        saveLatestDocument();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);
    window.document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      saveLatestDocument();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
      window.document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [docId]);

  function flushQueuedChanges() {
    if (!hasQueuedChanges()) {
      flushTimeoutRef.current = null;
      return;
    }

    const nextValue = queuedValueRef.current ?? "";
    queuedValueRef.current = null;
    flushTimeoutRef.current = null;

    const operations = getDiffOperations(contentRef.current, nextValue);

    if (operations.length === 0) {
      setSyncState(wsStatusRef.current === "connected" ? "live" : "offline");
      return;
    }

    contentRef.current = nextValue;
    saveOnExitRef.current = nextValue;
    lastSentRef.current = Date.now();
    setLastVisibleEditAt(lastSentRef.current);
    setSyncState(wsStatusRef.current === "connected" ? "live" : "offline");

    sendMessage({
      type: "EDIT_DOC",
      operations,
      content: nextValue,
    });
  }

  function queueLiveSync(nextValue: string) {
    const now = Date.now();
    const elapsed = now - lastSentRef.current;

    queuedValueRef.current = nextValue;
    saveOnExitRef.current = nextValue;

    if (flushTimeoutRef.current) {
      window.clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    if (elapsed >= throttleInterval) {
      flushQueuedChanges();
      return;
    }

    flushTimeoutRef.current = window.setTimeout(
      flushQueuedChanges,
      throttleInterval - elapsed,
    );
  }

  function handleChange(newValue: string) {
    if (newValue.length > 100000) return;

    queueLiveSync(newValue);
  }

  function handleToolbarAction(action: "bold" | "italic" | "heading") {
    const editor = textareaRef.current;

    if (!editor) {
      return;
    }

    const selectionStart = editor.selectionStart;
    const selectionEnd = editor.selectionEnd;
    const currentValue = editor.value;

    const nextSelection =
      action === "bold"
        ? applyMarkdownWrap(currentValue, selectionStart, selectionEnd, "**")
        : action === "italic"
          ? applyMarkdownWrap(currentValue, selectionStart, selectionEnd, "*")
          : applyHeading(currentValue, selectionStart, selectionEnd);

    setEditorValue(nextSelection.nextValue);
    queueLiveSync(nextSelection.nextValue);

    requestAnimationFrame(() => {
      if (!textareaRef.current) {
        return;
      }

      textareaRef.current.focus();
      textareaRef.current.selectionStart = nextSelection.selectionStart;
      textareaRef.current.selectionEnd = nextSelection.selectionEnd;
    });
  }

  const statusMeta = useMemo(() => {
    if (syncState === "offline") {
      return {
        label: "Offline",
        detail: "Live updates will resume automatically when the connection is back.",
        tone: "text-rose-600 bg-rose-50 border-rose-100",
      };
    }

    if (wsStatus === "connecting") {
      return {
        label: "Connecting",
        detail: "Rejoining the live session in the background.",
        tone: "text-amber-600 bg-amber-50 border-amber-100",
      };
    }

    if (syncState === "live") {
      return {
        label: "Live",
        detail: "Everyone viewing this document sees changes instantly.",
        tone: "text-emerald-700 bg-emerald-50 border-emerald-100",
      };
    }

    return {
      label: "Ready",
      detail: "Start typing to collaborate in real time.",
      tone: "text-violet-700 bg-violet-50 border-violet-100",
    };
  }, [syncState, wsStatus]);

  if (loading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/90 px-3 py-1 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur">
            <span className="soft-pulse h-2 w-2 rounded-full bg-emerald-500" />
            Markdown editing with real-time collaboration
          </div>

          <h1 className="title-font text-3xl font-semibold text-violet-900">
            {docRecord?.title}
          </h1>
          <p className="mt-2 text-sm text-violet-500">
            {formatLastChange(lastVisibleEditAt)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div
            className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${statusMeta.tone}`}
          >
            <span className="text-base leading-none">●</span>
            {statusMeta.label}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-200 bg-pink-100 text-sm text-pink-700 transition-transform duration-200 hover:scale-105"
                  title={user.email}
                >
                  {user.email[0].toUpperCase()}
                </div>
              ))}
            </div>

            <div className="text-right text-xs text-violet-500">
              <div className="font-semibold text-violet-700">
                {onlineUsers.length > 0
                  ? `${onlineUsers.length} collaborator${onlineUsers.length > 1 ? "s" : ""} online`
                  : "Only you are here"}
              </div>
              <div>{statusMeta.detail}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card mb-4 flex flex-wrap items-center justify-between gap-3 p-3 fade-up">
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary text-sm"
            onClick={() => handleToolbarAction("bold")}
            type="button"
          >
            Bold
          </button>
          <button
            className="btn-secondary text-sm"
            onClick={() => handleToolbarAction("italic")}
            type="button"
          >
            Italic
          </button>
          <button
            className="btn-secondary text-sm"
            onClick={() => handleToolbarAction("heading")}
            type="button"
          >
            H1
          </button>
        </div>

        <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
          Use Markdown shortcuts like **bold**, *italic*, and # headings.
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-[0_24px_60px_rgba(124,58,237,0.12)] transition-shadow duration-300 focus-within:shadow-[0_28px_70px_rgba(236,72,153,0.16)]">
        <textarea
          ref={textareaRef}
          defaultValue=""
          onChange={(e) => handleChange(e.target.value)}
          spellCheck={false}
          className="min-h-[540px] w-full resize-y border-0 bg-transparent p-6 text-lg leading-8 text-violet-950 focus:outline-none focus:ring-0"
          placeholder="Start typing in Markdown..."
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-violet-500">
        <span>{statusMeta.detail}</span>
        <span>
          {syncState === "offline"
            ? "Unsynced changes will be saved when the tab closes and the live connection returns"
            : "Your latest draft is also persisted when you close the tab"}
        </span>
      </div>
    </div>
  );
}

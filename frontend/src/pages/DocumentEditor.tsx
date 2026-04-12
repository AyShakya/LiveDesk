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
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retryInMs, setRetryInMs] = useState<number | null>(null);
  const [syncState, setSyncState] = useState<"ready" | "live" | "offline">(
    "ready",
  );
  const [lastVisibleEditAt, setLastVisibleEditAt] = useState<number | null>(null);
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);
  const membersPanelRef = useRef<HTMLDivElement | null>(null);

  const isSyncedWithWSRef = useRef(false);
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
  const hasLoadedDocumentRef = useRef(false);

  function setEditorValue(nextValue: string) {
    const editor = textareaRef.current;

    if (editor && editor.value !== nextValue) {
      editor.value = nextValue;
    }
  }

  useEffect(() => {
    if (!loading && textareaRef.current && contentRef.current !== undefined) {
      setEditorValue(contentRef.current);
    }
  }, [loading]);

  function hasQueuedChanges() {
    return queuedValueRef.current !== null;
  }

  useEffect(() => {
    wsStatusRef.current = wsStatus;
  }, [wsStatus]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!membersPanelRef.current) {
        return;
      }

      if (!membersPanelRef.current.contains(event.target as Node)) {
        setIsMembersPanelOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMembersPanelOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!docId) return;

    let isCancelled = false;
    const isInitialLoad = !hasLoadedDocumentRef.current;

    isSyncedWithWSRef.current = false;
    setOnlineUsers([]);
    setSyncState("ready");
    setRetryAttempt(0);
    setRetryInMs(null);

    if (isInitialLoad) {
      setLoading(true);
    }

    async function load() {
      try {
        const data = await getDocument(docId as string);

        if (isCancelled) return;

        setDocRecord(data);
        hasLoadedDocumentRef.current = true;
        
        if (!isSyncedWithWSRef.current) {
          contentRef.current = data.content;
          saveOnExitRef.current = data.content;
          setEditorValue(data.content);
          setLastVisibleEditAt(data.content ? Date.now() : null);
        }
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

    const unsubscribeNetworkListener = connectWebSocket(
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

          if (message.type === "DOC_SYNC") {
            isSyncedWithWSRef.current = true;
            setLoading(false);
          }

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
      (meta) => {
        setWsStatus(meta.status);
        setRetryAttempt(meta.retryAttempt);
        setRetryInMs(meta.nextRetryInMs ?? null);

        setSyncState((currentState) => {
          if (meta.status === "disconnected") {
            return "offline";
          }

          if (meta.status === "connected") {
            return currentState === "ready" && !hasQueuedChanges() ? "ready" : "live";
          }

          return currentState;
        });
      },
    );

    return () => {
      unsubscribeNetworkListener?.();
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
      if (loading || !isSyncedWithWSRef.current) {
        return;
      }

      const latestValue = queuedValueRef.current ?? textareaRef.current?.value ?? saveOnExitRef.current;

      if (latestValue === null || latestValue === undefined || latestValue === contentRef.current) {
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
        detail:
          retryInMs && retryAttempt > 0
            ? `Retrying automatically (attempt ${retryAttempt}) in ${Math.ceil(retryInMs / 1000)}s.`
            : "Live updates will resume automatically when the connection is back.",
        tone: "text-[#8a2d2b] bg-[#ffd9d7]",
      };
    }

    if (wsStatus === "connecting") {
      return {
        label: "Connecting",
        detail: "Rejoining the live session in the background.",
        tone: "text-[#7b6400] bg-[#fff2bf]",
      };
    }

    if (syncState === "live") {
      return {
        label: "Live",
        detail: "Everyone viewing this document sees changes instantly.",
        tone: "text-[#007169] bg-[#cdeee9]",
      };
    }

    return {
      label: "Ready",
      detail: "Start typing to collaborate in real time.",
      tone: "text-[#6236ff] bg-[#ece8ff]",
    };
  }, [retryAttempt, retryInMs, syncState, wsStatus]);

  if (loading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#cdeee9] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.05em] text-[#007169]">
            <span className="soft-pulse h-2 w-2 rounded-full bg-emerald-500" />
            Markdown editing with real-time collaboration
          </div>

          <h1 className="title-font text-6xl font-extrabold tracking-[-0.02em] text-[#373830]">
            {docRecord?.title}
          </h1>
          <p className="mt-2 text-sm text-[#66695e]">
            {formatLastChange(lastVisibleEditAt)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div
            className={`inline-flex min-h-9 items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${statusMeta.tone}`}
          >
            <span className="text-base leading-none">●</span>
            {statusMeta.label}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#fefdf1] bg-[#ffc3bf] text-sm text-[#8a2d2b] transition-transform duration-200 hover:scale-105"
                  title={user.email}
                >
                  {user.email[0].toUpperCase()}
                </div>
              ))}
            </div>

            <div className="text-right text-xs text-[#66695e]">
              <div className="font-semibold text-[#373830]">
                {onlineUsers.length > 0
                  ? `${onlineUsers.length} collaborator${onlineUsers.length > 1 ? "s" : ""} online`
                  : "Only you are here"}
              </div>
              <div>{statusMeta.detail}</div>
            </div>
          </div>

          <div className="relative w-full max-w-sm" ref={membersPanelRef}>
            <button
              type="button"
              onClick={() => setIsMembersPanelOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-2xl bg-[#f0efe4] px-4 py-2.5 text-left text-xs font-semibold text-[#373830] transition-all duration-200 hover:bg-[#e8e6d8]"
              aria-expanded={isMembersPanelOpen}
              aria-haspopup="true"
            >
              <span>
                Active members in this document ({onlineUsers.length})
              </span>
              <span
                className={`text-[#66695e] transition-transform duration-200 ${isMembersPanelOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            <div
              className={`pointer-events-none absolute right-0 z-10 mt-2 w-full origin-top rounded-2xl bg-white p-2 shadow-[0px_20px_40px_rgba(55,56,48,0.08)] transition-all duration-200 ${
                isMembersPanelOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "-translate-y-2 scale-95 opacity-0"
              }`}
            >
              <ul className="max-h-56 space-y-1 overflow-auto pr-1">
                {onlineUsers.length === 0 ? (
                  <li className="rounded-lg bg-[#fbfaed] px-2 py-1.5 text-xs text-[#66695e]">
                    No other active members in this document right now.
                  </li>
                ) : (
                  onlineUsers.map((user) => (
                    <li
                      key={`member-${user.id}`}
                      className="rounded-lg bg-[#fbfaed] px-2 py-1.5 text-xs text-[#373830]"
                    >
                      {user.email}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/90 p-3 fade-up shadow-[0px_20px_40px_rgba(55,56,48,0.06)]">
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary text-sm px-5 py-2"
            onClick={() => handleToolbarAction("bold")}
            type="button"
          >
            Bold
          </button>
          <button
            className="btn-secondary text-sm px-5 py-2"
            onClick={() => handleToolbarAction("italic")}
            type="button"
          >
            Italic
          </button>
          <button
            className="btn-secondary text-sm px-5 py-2"
            onClick={() => handleToolbarAction("heading")}
            type="button"
          >
            H1
          </button>
        </div>

        <div className="rounded-full bg-[#ece8ff] px-4 py-1.5 text-xs font-medium text-[#6236ff]">
          Use Markdown shortcuts like **bold**, *italic*, and # headings.
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.25rem] bg-white shadow-[0px_20px_40px_rgba(55,56,48,0.06)] transition-shadow duration-300 focus-within:shadow-[0px_24px_50px_rgba(55,56,48,0.1)]">
        <textarea
          ref={textareaRef}
          defaultValue=""
          onChange={(e) => handleChange(e.target.value)}
          spellCheck={false}
          className="min-h-[540px] w-full resize-y border-0 bg-transparent p-8 text-lg leading-8 text-[#373830] focus:outline-none focus:ring-0"
          placeholder="Start typing in Markdown..."
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.05em] text-[#66695e]">
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

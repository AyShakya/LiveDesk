import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocument } from "../api/documents";
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

export default function DocumentEditor() {
  const { id, docId } = useParams<{ id: string; docId: string }>();

  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [syncState, setSyncState] = useState<
    "ready" | "syncing" | "live" | "offline"
  >("ready");
  const [lastVisibleEditAt, setLastVisibleEditAt] = useState<number | null>(null);

  const lastSentRef = useRef(0);
  const throttleInterval = 45;
  const isRemoteUpdate = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const contentRef = useRef(content);
  const flushTimeoutRef = useRef<number | null>(null);
  const queuedValueRef = useRef<string | null>(null);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    if (!docId) return;

    let isCancelled = false;

    async function load() {
      try {
        const data = await getDocument(docId as string);

        if (isCancelled) return;

        setDocument(data);
        setContent(data.content);
        setLastVisibleEditAt(Date.now());
      } catch (error) {
        if (isCancelled) return;
        console.error("Failed to load document", error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    load();

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
        if (message.type === "DOC_SYNC") {
          contentRef.current = message.content;
          setContent(message.content);
          setDocument((currentDocument) =>
            currentDocument
              ? { ...currentDocument, content: message.content }
              : currentDocument,
          );
          setLastVisibleEditAt(Date.now());
          setSyncState("live");
          return;
        }

        if (message.type === "DOC_UPDATED") {
          const updated = applyDiffOperations(
            contentRef.current,
            message.operations,
          );
          const el = textareaRef.current;
          const cursorPos = el?.selectionStart || 0;
          const nextCursorPos = getSelectionAfterOperations(
            cursorPos,
            message.operations,
          );

          isRemoteUpdate.current = true;
          contentRef.current = updated;
          setContent(updated);
          setDocument((currentDocument) =>
            currentDocument
              ? { ...currentDocument, content: updated }
              : currentDocument,
          );
          setLastVisibleEditAt(Date.now());
          setSyncState("live");

          requestAnimationFrame(() => {
            if (el) {
              el.selectionStart = nextCursorPos;
              el.selectionEnd = nextCursorPos;
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

          if (status === "connecting") {
            return currentState === "ready" ? "ready" : "syncing";
          }

          return queuedValueRef.current ? "syncing" : "live";
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
    if (syncState !== "syncing") {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!queuedValueRef.current) {
        setSyncState(wsStatus === "connected" ? "live" : "offline");
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [syncState, wsStatus]);

  function flushQueuedChanges() {
    if (!queuedValueRef.current) {
      flushTimeoutRef.current = null;
      return;
    }

    const nextValue = queuedValueRef.current;
    queuedValueRef.current = null;
    flushTimeoutRef.current = null;

    const operations = getDiffOperations(contentRef.current, nextValue);

    if (operations.length === 0) {
      setSyncState(wsStatus === "connected" ? "live" : "offline");
      return;
    }

    contentRef.current = nextValue;
    lastSentRef.current = Date.now();
    setLastVisibleEditAt(lastSentRef.current);
    setSyncState(wsStatus === "connected" ? "syncing" : "offline");

    sendMessage({
      type: "EDIT_DOC",
      operations,
    });
  }

  function queueLiveSync(nextValue: string) {
    const now = Date.now();
    const elapsed = now - lastSentRef.current;

    queuedValueRef.current = nextValue;
    setSyncState(wsStatus === "connected" ? "syncing" : "offline");

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

    setContent(newValue);
    setDocument((currentDocument) =>
      currentDocument ? { ...currentDocument, content: newValue } : currentDocument,
    );
    setLastVisibleEditAt(Date.now());

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    queueLiveSync(newValue);
  }

  const statusMeta = useMemo(() => {
    if (syncState === "offline") {
      return {
        label: "Offline",
        detail: "Live updates will resume automatically when the connection is back.",
        tone: "text-rose-600 bg-rose-50 border-rose-100",
      };
    }

    if (syncState === "syncing" || wsStatus === "connecting") {
      return {
        label: "Syncing live",
        detail: "Your edits are being pushed instantly to collaborators.",
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
    return (
      <div className="flex h-[60vh] items-center justify-center text-violet-700">
        Loading document...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/90 px-3 py-1 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500 soft-pulse" />
            Real-time collaboration enabled
          </div>

          <h1 className="title-font text-3xl font-semibold text-violet-900">
            {document?.title}
          </h1>
          <p className="mt-2 text-sm text-violet-500">
            {formatLastChange(lastVisibleEditAt)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${statusMeta.tone}`}
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
          <button className="btn-secondary text-sm">Bold</button>
          <button className="btn-secondary text-sm">Italic</button>
          <button className="btn-secondary text-sm">H1</button>
        </div>

        <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
          {wsStatus === "connected"
            ? "Collaborators update instantly as you type"
            : "Reconnecting live session…"}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-[0_24px_60px_rgba(124,58,237,0.12)] transition-shadow duration-300 focus-within:shadow-[0_28px_70px_rgba(236,72,153,0.16)]">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[540px] w-full resize-y border-0 bg-transparent p-6 text-lg leading-8 text-violet-950 focus:outline-none focus:ring-0"
          placeholder="Start typing..."
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-violet-500">
        <span>{statusMeta.detail}</span>
        <span>
          {syncState === "offline"
            ? "Edits are kept locally until the live connection returns"
            : "Document stays synced across every open screen in real time"}
        </span>
      </div>
    </div>
  );
}

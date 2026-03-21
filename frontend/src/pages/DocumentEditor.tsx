import { useEffect, useState, useRef } from "react";
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
      return nextCursor
    }

    if (operation.type === "insert") {
      return nextCursor + operation.text.length
    }

    if (operation.type === "delete") {
      const deletionEnd = operation.index + operation.length
      if (deletionEnd <= nextCursor) {
        return Math.max(operation.index, nextCursor - operation.length)
      }

      return operation.index
    }

    const replacedEnd = operation.index + operation.length

    if (replacedEnd <= nextCursor) {
      return operation.index + operation.text.length + (nextCursor - replacedEnd)
    }

    return operation.index + operation.text.length
  }, cursorPos)
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

  const lastSentRef = useRef(0);
  const THROTTLE_INTERVAL = 100; 
  const isRemoteUpdate = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const contentRef = useRef(content);
  const lastEditedAtRef = useRef<number | null>(null);

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

          requestAnimationFrame(() => {
            if (el) {
              el.selectionStart = nextCursorPos;
              el.selectionEnd = nextCursorPos;
            }
          });
        }

        if (message.type === "PRESENCE_UPDATE") {
          setOnlineUsers(message.users || []);
        }
      },

      (status) => {
        setWsStatus(status);
      },
    );

    return () => {
      disconnectWebSocket();

      setWsStatus("disconnected");
    };
  }, [id, docId]);

  function handleChange(newValue: string) {
    if (newValue.length > 100000) return;
    const oldValue = contentRef.current;

    setContent(newValue);
    contentRef.current = newValue;

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const now = Date.now();

    if (now - lastSentRef.current > THROTTLE_INTERVAL) {
      const operations = getDiffOperations(oldValue, newValue);
      if (operations.length === 0) {
        return;
      }
      lastSentRef.current = now;
      lastEditedAtRef.current = now;

      sendMessage({
        type: "EDIT_DOC",
        operations,
      });
    }
  }

  const saveIndicator = 
    lastEditedAtRef.current === null ? "Autosave ready" : wsStatus === "connected" ? "Changes sycning live" : "Changes will sync when connection resumes";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-violet-700">
        Loading document...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="title-font text-3xl font-semibold text-violet-900">
          {document?.title}
        </h1>

        <div className="flex items-center gap-6">
          <div className="flex -space-x-2">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 text-sm flex items-center justify-center border border-pink-200 transition-transform duration-200 hover:scale-105"
              >
                {user.email[0].toUpperCase()}
              </div>
            ))}
          </div>

          <div className="text-sm">
            {wsStatus === "connected" && (
              <span className="text-violet-700 soft-pulse">● Live</span>
            )}

            {wsStatus === "connecting" && (
              <span className="text-amber-500">● Connecting</span>
            )}

            {wsStatus === "disconnected" && (
              <span className="text-rose-600">● Offline</span>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-3 mb-4 flex flex-wrap items-center justify-between gap-3 fade-up">
        <div className="flex gap-2">
          <button className="btn-secondary text-sm">Bold</button>

        <button className="btn-secondary text-sm">Italic</button>

        <button className="btn-secondary text-sm">H1</button>
        </div>

        <div className="text-xs font-medium text-violet-500">
          {onlineUsers.length > 0
            ? `${onlineUsers.length} collaborator${onlineUsers.length > 1 ? "s" : ""} online`
            : "Only you are viewing this document"}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full min-h-[500px] rounded-2xl border border-violet-100 bg-white p-6 text-lg leading-7 text-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-300 shadow-[0_20px_45px_rgba(124,58,237,0.08)] transition-shadow duration-300 focus:shadow-[0_22px_50px_rgba(236,72,153,0.15)]"
        placeholder="Start typing..."
      />

      <div className="text-xs text-violet-500 mt-4">
        {saveIndicator} • Real-time collaboration
      </div>
    </div>
  );
}

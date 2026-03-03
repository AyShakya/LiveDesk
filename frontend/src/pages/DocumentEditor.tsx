import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getDocument } from "../api/documents";
import type { Document } from "../types/document";
import {
  connectWebSocket,
  sendMessage,
  disconnectWebSocket,
} from "../ws/client";
import type { PresenceUser } from "../types/ws";

export default function DocumentEditor() {
  const { id, docId } = useParams<{ id: string; docId: string }>();

  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (!docId) return;
    load();
  }, [docId]);

  useEffect(() => {
    if (!id || !docId) return;

    const token = localStorage.getItem("token");
    const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}&workspaceId=${id}&docId=${docId}`;

    connectWebSocket(
      wsUrl,
      (message) => {
        if (message.type === "document:update") {
          isRemoteUpdate.current = true;
          setContent(message.payload.content);
        }

        if (message.type === "presence:update") {
          setOnlineUsers(message.payload.users);
        }
      },
      (status) => {
        setWsStatus(status);
      },
    );

    return () => {
      disconnectWebSocket();
    };
  }, [id, docId]);

  async function load() {
    if (!docId) return;
    const data = await getDocument(docId);
    setDocument(data);
    setContent(data.content);
    setLoading(false);
  }

  function handleChange(newValue: string) {
    setContent(newValue);

    if (!isRemoteUpdate.current) {
      sendMessage({
        type: "document:update",
        payload: { content: newValue },
      });
    }

    isRemoteUpdate.current = false;
  }

  if (loading) return <div>Loading document...</div>;
  if (!document) return <div>Document not found</div>;

  return (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{document.title}</h1>

      <div className="text-sm">
        {wsStatus === "connected" && (
          <span className="text-green-600">● Connected</span>
        )}
        {wsStatus === "connecting" && (
          <span className="text-yellow-600">● Connecting...</span>
        )}
        {wsStatus === "disconnected" && (
          <span className="text-red-600">● Disconnected</span>
        )}
      </div>
    </div>

    {/* Presence */}
    <div className="flex gap-2 mb-6 flex-wrap">
      {onlineUsers.map((user) => (
        <div
          key={user.id}
          className="px-3 py-1 bg-gray-200 rounded-full text-sm"
        >
          {user.email}
        </div>
      ))}
    </div>

    {/* Editor */}
    <textarea
      value={content}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full h-[400px] border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)
}

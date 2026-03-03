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
      <h1>{document.title}</h1>
      <div style={{ marginBottom: "10px" }}>
        <strong>Online:</strong>
        {onlineUsers.length === 0 && " No one else online"}

        {onlineUsers.map((user) => (
          <span
            key={user.id}
            style={{
              marginLeft: "8px",
              padding: "4px 8px",
              background: "#eee",
              borderRadius: "8px",
            }}
          >
            {user.email}
          </span>
        ))}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Status:</strong> {wsStatus === "connected" && "🟢 Connected"}
        {wsStatus === "connecting" && "🟡 Connecting..."}
        {wsStatus === "disconnected" && "🔴 Disconnected"}
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        style={{ width: "100%", height: "300px" }}
      />
    </div>
  );
}

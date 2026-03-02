import { WebSocketServer } from "ws";
import { userOffline } from "../modules/presence/presence.service.js";
import jwt from "jsonwebtoken";
// WebSocket sends ONLY real-time events.
// Initial document & presence state must be fetched via HTTP before connecting.
const workspaceDocs = new Map();
const ALLOWED_MESSAGE_TYPES = new Set(["EDIT_DOC"]);
/*
workspaceDocs = {
  workspaceId: {
    docId: Set<ws>
  }
}
*/
export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");
      const workspaceId = url.searchParams.get("workspaceId");
      const docId = url.searchParams.get("docId");

      if (!token || !workspaceId || !docId) {
        ws.close();
        return;
      }

      const user = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = user.id;
      ws.workspaceId = workspaceId;
      ws.docId = docId;
      if (!workspaceDocs.has(workspaceId)) {
        workspaceDocs.set(workspaceId, new Set());
      }

      const docs = workspaceDocs.get(workspaceId);

      if (!docs.has(docId)) {
        docs.set(docId, new Set());
      }

      docs.get(docId).add(ws);

      ws.on("message", async (raw) => {
        let message;
        try {
          message = JSON.parse(raw);
        } catch {
          return; 
        }

        if (!message || typeof message !== "object") return;
        if (!ALLOWED_MESSAGE_TYPES.has(message.type)) return;

        try {
          if (message.type === "EDIT_DOC") {
            if (typeof message.content !== "string") return;
            await handleDocEdit(ws, message);
          }
        } catch (err) {
          console.error("WS message handling failed:", err.message);
        }
      });

      ws.on("close", async () => {
        docs.get(docId)?.delete(ws);
        if (docs.get(docId)?.size === 0) {
          docs.delete(docId);
        }
        if (docs.size === 0) {
          workspaceDocs.delete(workspaceId);
        }
        try {
          await userOffline(workspaceId, ws.userId);
        } catch (err) {
          console.error("Failed to mark user offline:", err.message);
        }
      });
    } catch (err) {
      ws.close();
    }
  });

  return {
    broadcast(workspaceId, message) {
      const docs = workspaceDocs.get(String(workspaceId));
      if (!docs) return;

      for (const ws of sockets) {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    },
    broadcastDoc(workspaceId, docId, message) {
      const docs = workspaceDocs.get(String(workspaceId));
      if (!docs) return;

      const sockets = docs.get(String(docId));
      if (!sockets) return;

      for (const ws of sockets) {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    },
  };
}

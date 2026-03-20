import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { userOffline } from "../modules/presence/presence.service.js";
import { handleDocEdit } from "../modules/document/document.realtime.js";
import {
  getDocument,
  isWorkspaceMember,
} from "../modules/document/document.repo.js";
import { documentCache } from "./cacheModule.js";

const workspaceDocs = new Map();

const ALLOWED_MESSAGE_TYPES = new Set(["EDIT_DOC", "PING"]);

export function broadcastLocalDoc(workspaceId, docId, message) {
  const docs = workspaceDocs.get(String(workspaceId));
  if (!docs) return;

  const sockets = docs.get(String(docId));
  if (!sockets) return;

  for (const ws of sockets) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

export function initWebSocket(server) {

  const wss = new WebSocketServer({ server });

  console.log("WebSocket server initialized");

  wss.on("connection", async (ws, req) => {

    try {

      const url = new URL(req.url, `http://${req.headers.host}`);

      const token = url.searchParams.get("token");
      const workspaceId = url.searchParams.get("workspaceId");
      const docId = url.searchParams.get("docId");

      if (!token || !workspaceId || !docId) {
        console.log("WS rejected: missing params");
        ws.close();
        return;
      }

      let user;

      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.log("WS rejected: invalid token");
        ws.close();
        return;
      }

      const allowedWorkspace = await isWorkspaceMember(workspaceId, user.userId);

      if (!allowedWorkspace) {
        console.log(
          `WS rejected: user=${user.userId} is not a member of workspace=${workspaceId}`,
        );
        ws.close();
        return;
      }

      const document = await getDocument(docId);

      if (!document || String(document.workspace_id) !== String(workspaceId)) {
        console.log(
          `WS rejected: doc=${docId} is not accessible in workspace=${workspaceId}`,
        );
        ws.close();
        return;
      }

      ws.userId = user.userId;
      ws.workspaceId = workspaceId;
      ws.docId = docId;

      console.log(
        `WS connected user=${ws.userId} workspace=${workspaceId} doc=${docId}`,
      );

      if (!workspaceDocs.has(workspaceId)) {
        workspaceDocs.set(workspaceId, new Map());
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
          console.log("Invalid WS message");
          return;
        }

        if (!message || typeof message !== "object") return;

        if (!ALLOWED_MESSAGE_TYPES.has(message.type)) return;

        try {

          if (message.type === "PING") {
            ws.send(JSON.stringify({ type: "PONG" }));
            return;
          }

          if (message.type === "EDIT_DOC") {

            if (typeof message.content !== "string") return;

            await handleDocEdit(ws, message);
          }

        } catch (err) {
          console.error("WS message handling error:", err);
        }
      });

      ws.on("close", async () => {

        console.log(
          `WS disconnected user=${ws.userId} workspace=${workspaceId} doc=${docId}`,
        );

        const docSockets = docs.get(docId);

        docSockets?.delete(ws);

        if (docSockets?.size === 0) {
          docs.delete(docId);
          documentCache.delete(docId);
        }

        if (docs.size === 0) {
          workspaceDocs.delete(workspaceId);
        }

        try {
          await userOffline(workspaceId, ws.userId);
        } catch (err) {
          console.error("Presence update failed:", err);
        }

      });

    } catch (err) {
      console.error("WS connection setup failed:", err);
      ws.close();
    }

  });

  return {

    broadcast(workspaceId, message) {

      const docs = workspaceDocs.get(String(workspaceId));
      if (!docs) return;

      for (const sockets of docs.values()) {
        for (const ws of sockets) {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(message));
          }
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

import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { getOnlineUsers, userOffline, userOnline } from "../modules/presence/presence.service.js";
import { handleDocEdit } from "../modules/document/document.realtime.js";
import {
  getDocument,
  isWorkspaceMember,
} from "../modules/document/document.repo.js";
import { documentCache, flushAndDeleteCachedDocument } from "./cacheModule.js";

const workspaceDocs = new Map();
export const WS_SERVER_INSTANCE_ID = `ws-${process.pid}`;

const ALLOWED_MESSAGE_TYPES = new Set(["EDIT_DOC", "PING"]);

function isValidOperations(operation) {
  if (!operation || typeof operation !== "object") {
    return false;
  }

  if (typeof operation.index !== "number" || operation.index < 0) {
    return false;
  }

  if (operation.type === "insert") {
    return typeof operation.text === "string";
  }

  if (operation.type === "delete") {
    return typeof operation.length === "number" && operation.length >= 0;
  }

  if (operation.type === "replace") {
    return (
      typeof operation.length === "number" &&
      operation.length >= 0 &&
      typeof operation.text === "string"
    );
  }

  return false;
}

export function broadcastLocalDoc(workspaceId, docId, message, options = {}) {
  const docs = workspaceDocs.get(String(workspaceId));
  if (!docs) return;

  const sockets = docs.get(String(docId));
  if (!sockets) return;

  for (const ws of sockets) {
    if (options.excludeUserId !== undefined && String(ws.userId) === String(options.excludeUserId)) {
      continue;
    }
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

      const allowedWorkspace = await isWorkspaceMember(
        workspaceId,
        user.userId,
      );

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
      ws.serverInstanceId = WS_SERVER_INSTANCE_ID;

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
      const cachedDocument = documentCache.get(docId);
      await userOnline(workspaceId, ws.userId);
      const onlineUsers = await getOnlineUsers(workspaceId);

      ws.send(
        JSON.stringify({
          type: "DOC_SYNC",
          docId,
          content: cachedDocument?.content ?? document.content ?? "",
        }),
      );

      ws.send(
        JSON.stringify({
          type: "PRESENCE_UPDATE",
          users: onlineUsers,
        })
      )

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
            if(!Array.isArray(message.operations) || message.operations.length === 0 || !message.operations.every(isValidOperations)){
              return;
            }

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
          try {
            await flushAndDeleteCachedDocument(docId);
          } catch (err) {
            console.error("Failed to flush document on disconnect:", err);
          }
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

    broadcastDoc(workspaceId, docId, message, options = {}) {
      const docs = workspaceDocs.get(String(workspaceId));
      if (!docs) return;

      const sockets = docs.get(String(docId));
      if (!sockets) return;

      for (const ws of sockets) {
        if (options.excludeUserId !== undefined && String(ws.userId) === String(options.excludeUserId)) continue;
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    },
  };
}

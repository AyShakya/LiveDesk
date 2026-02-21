import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const workspaceSockets = new Map();

export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");
      const workspaceId = url.searchParams.get("workspaceId");

      if (!token || !workspaceId) {
        ws.close();
        return;
      }

      const user = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = user.id;
      ws.workspaceId = workspaceId;

      if (!workspaceSockets.has(workspaceId)) {
        workspaceSockets.set(workspaceId, new Set());
      }

      workspaceSockets.get(workspaceId).add(ws);

      ws.on("close", () => {
        workspaceSockets.get(workspaceId)?.delete(ws);
        if (workspaceSockets.get(workspaceId)?.size === 0) {
          workspaceSockets.delete(workspaceId);
        }
      });

    } catch (err) {
      ws.close();
    }
  });

  return {
    broadcast(workspaceId, message) {
      const sockets = workspaceSockets.get(String(workspaceId));
      if (!sockets) return;

      for (const ws of sockets) {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    },
  };
}
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import pool from "./config/postgres.js";
import redis from "./config/redis.js";
import { subscribeToPresenceEvents } from "./modules/presence/presence.pubsub.js";
import { initWebSocket, WS_SERVER_INSTANCE_ID } from "./websocket/ws.server.js";
import { subscribeToDocumentEvents } from "./modules/document/document.pubsub.js";
import http, { get } from "http";
import { startDocumentWorkers } from "./modules/document/document.worker.js";
import { getOnlineUsers } from "./modules/presence/presence.service.js";

const PORT = process.env.PORT;
const server = http.createServer(app);
const ws = initWebSocket(server);
startDocumentWorkers();

async function waitForDependencies(retries = 10) {
  while (retries) {
    try {
      console.log("Checking PostgreSQL...");
      await pool.query("SELECT 1");

      console.log("Checking Redis...");
      await redis.ping();

      console.log("All dependencies ready ✅");
      return;
    } catch (error) {
      console.log("Dependencies not ready, retrying in 3s...");
      await new Promise((res) => setTimeout(res, 3000));
      retries--;
    }
  }
  throw new Error("Dependencies not ready after retries");
}

async function startServer() {
  try {
    await waitForDependencies();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

subscribeToPresenceEvents(async (event) => {
  const users = await getOnlineUsers(event.workspaceId);
  ws.broadcast(event.workspaceId, {
    type: "PRESENCE_UPDATE",
    workspaceId: event.workspaceId,
    users,
  });
});
subscribeToDocumentEvents((event) => {
  try {
    if (event.sourceInstance === WS_SERVER_INSTANCE_ID) {
      return;
    }
    ws.broadcastDoc(event.workspaceId, event.docId, event, {
      excludeUserId: event.updatedBy,
    });
  } catch (err) {
    console.error("Failed to broadcast doc event:", err.message);
  }
});
startServer();

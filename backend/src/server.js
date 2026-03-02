import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import pool from "./config/postgres.js";
import redis from "./config/redis.js"
import { subscribeToPresenceEvents } from "./modules/presence/presence.pubsub.js";
import { initWebSocket } from "./websocket/ws.server.js";
import { subscribeToDocumentEvents } from "./modules/document/document.pubsub.js";

const PORT = process.env.PORT;
const ws = initWebSocket(server);

async function startServer() {
    try {
        await pool.query("SELECT 1");
        await redis.ping();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

subscribeToPresenceEvents((event) => {
  ws.broadcast(event.workspaceId, event);
});
subscribeToDocumentEvents((event) => {
  try {
    ws.broadcastDoc(event.workspaceId, event.docId, event);
  } catch (err) {
    console.error("Failed to broadcast doc event:", err.message);
  }
});
startServer();
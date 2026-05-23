import pool from "../../config/postgres.js";
import redis from "../../config/redis.js";
import { publishPresenceEvent } from "./presence.pubsub.js";
import { createPresenceManager } from "./presence.logic.js";

const presenceManager = createPresenceManager({
  redis,
  pool,
  publishPresenceEvent,
});

export const userOnline = presenceManager.userOnline;
export const userOffline = presenceManager.userOffline;
export const getOnlineUsers = presenceManager.getOnlineUsers;
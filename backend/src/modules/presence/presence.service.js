import pool from "../../config/postgres.js";
import redis from "../../config/redis.js";
import { publishPresenceEvent } from "./presence.pubsub.js";

function key(workspaceId) {
  return `workspace:${workspaceId}:online_users`;
}

export async function userOnline(workspaceId, userId) {
  await redis.sadd(key(workspaceId), userId);
  publishPresenceEvent({
    type: "USER_ONLINE",
    workspaceId,
    userId,
  });
}

export async function userOffline(workspaceId, userId) {
  await redis.srem(key(workspaceId), userId);
  publishPresenceEvent({
    type: "USER_OFFLINE",
    workspaceId,
    userId,
  });
}

export async function getOnlineUsers(workspaceId) {
  const userIds = await redis.smembers(key(workspaceId));

  if (userIds.length === 0) {
    return [];
  }

  const query = `
    SELECT id, email
    FROM users
    WHERE id = ANY($1::int[])
    ORDER BY email
  `;
  const { rows } = await pool.query(query, [userIds.map(Number)]);

  return rows.map((user) => ({
    id: String(user.id),
    email: user.email,
  }));
}
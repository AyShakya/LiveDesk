import pool from "../../config/postgres.js";
import redis from "../../config/redis.js";
import { publishPresenceEvent } from "./presence.pubsub.js";

function usersKey(workspaceId) {
  return `workspace:${workspaceId}:online_users`;
}

function connectionCountKey(workspaceId, userId) {
  return `workspace:${workspaceId}:user:${userId}:connection_count`;
}

export async function userOnline(workspaceId, userId) {
  const count = await redis.incr(connectionCountKey(workspaceId, userId));

  // Emit ONLINE only for the first active connection of this user in this workspace.
  if (count === 1) {
    await redis.sadd(usersKey(workspaceId), userId);
    publishPresenceEvent({
      type: "USER_ONLINE",
      workspaceId,
      userId,
    });
  }
}

export async function userOffline(workspaceId, userId) {
  const count = await redis.decr(connectionCountKey(workspaceId, userId));

  if (count <= 0) {
    await redis.del(connectionCountKey(workspaceId, userId));

    const removed = await redis.srem(usersKey(workspaceId), userId);

    // Emit OFFLINE only when the user leaves the online set.
    if (removed > 0) {
      publishPresenceEvent({
        type: "USER_OFFLINE",
        workspaceId,
        userId,
      });
    }
  }
}

export async function getOnlineUsers(workspaceId) {
  const userIds = await redis.smembers(usersKey(workspaceId));

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
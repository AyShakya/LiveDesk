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
  const users = await redis.smembers(key(workspaceId));
  return users.map(Number);
}
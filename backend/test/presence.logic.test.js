import test from "node:test";
import assert from "node:assert/strict";
import { createPresenceManager } from "../src/modules/presence/presence.logic.js";

function createFakeRedis() {
  const data = new Map();
  const sets = new Map();

  function usersKey(key) {
    return key;
  }

  return {
    async eval(script, numKeys, connectionKey, onlineKey, userId) {
      if (script.includes("INCR")) {
        const current = Number(data.get(connectionKey) || 0) + 1;
        data.set(connectionKey, current);
        if (!sets.has(usersKey(onlineKey))) {
          sets.set(usersKey(onlineKey), new Set());
        }
        if (current === 1) {
          sets.get(usersKey(onlineKey)).add(String(userId));
          return 1;
        }
        return 0;
      }

      const current = Number(data.get(connectionKey) || 0);
      if (current <= 0) {
        data.delete(connectionKey);
        sets.get(usersKey(onlineKey))?.delete(String(userId));
        return 0;
      }

      const next = current - 1;
      if (next <= 0) {
        data.delete(connectionKey);
        const onlineUsers = sets.get(usersKey(onlineKey));
        if (onlineUsers) {
          const removed = onlineUsers.delete(String(userId));
          return removed ? 1 : 0;
        }
        return 0;
      }

      data.set(connectionKey, next);
      return 0;
    },
    async smembers(key) {
      return Array.from(sets.get(key) || []);
    },
  };
}

test("presence manager emits online only on first connection", async () => {
  const published = [];
  const redis = createFakeRedis();
  const pool = {
    async query() {
      return { rows: [{ id: 4, email: "a@example.com" }] };
    },
  };

  const manager = createPresenceManager({
    redis,
    pool,
    publishPresenceEvent: async (event) => published.push(event),
  });

  await manager.userOnline(4, 4);
  await manager.userOnline(4, 4);

  assert.equal(published.length, 1);
  assert.equal(published[0].type, "USER_ONLINE");
});

test("presence manager emits offline only on final disconnect", async () => {
  const published = [];
  const redis = createFakeRedis();
  const pool = {
    async query() {
      return { rows: [{ id: 4, email: "a@example.com" }] };
    },
  };

  const manager = createPresenceManager({
    redis,
    pool,
    publishPresenceEvent: async (event) => published.push(event),
  });

  await manager.userOffline(4, 4);
  await manager.userOnline(4, 4);
  await manager.userOnline(4, 4);
  await manager.userOffline(4, 4);
  await manager.userOffline(4, 4);

  assert.equal(published.filter((event) => event.type === "USER_OFFLINE").length, 1);
});

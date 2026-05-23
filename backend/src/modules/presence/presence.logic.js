function usersKey(workspaceId) {
  return `workspace:${workspaceId}:online_users`;
}

function connectionCountKey(workspaceId, userId) {
  return `workspace:${workspaceId}:user:${userId}:connection_count`;
}

const USER_ONLINE_SCRIPT = `
  local count = redis.call("INCR", KEYS[1])
  if count == 1 then
    redis.call("SADD", KEYS[2], ARGV[1])
    return 1
  end
  return 0
`;

const USER_OFFLINE_SCRIPT = `
  local current = tonumber(redis.call("GET", KEYS[1]) or "0")
  if current <= 0 then
    redis.call("DEL", KEYS[1])
    redis.call("SREM", KEYS[2], ARGV[1])
    return 0
  end

  local count = redis.call("DECR", KEYS[1])
  if count <= 0 then
    redis.call("DEL", KEYS[1])
    local removed = redis.call("SREM", KEYS[2], ARGV[1])
    if removed > 0 then
      return 1
    end
  end

  return 0
`;

export function createPresenceManager({ redis, pool, publishPresenceEvent }) {
  async function userOnline(workspaceId, userId) {
    const emitted = await redis.eval(
      USER_ONLINE_SCRIPT,
      2,
      connectionCountKey(workspaceId, userId),
      usersKey(workspaceId),
      String(userId),
    );

    if (Number(emitted) === 1) {
      await publishPresenceEvent({
        type: "USER_ONLINE",
        workspaceId,
        userId,
      });
    }
  }

  async function userOffline(workspaceId, userId) {
    const emitted = await redis.eval(
      USER_OFFLINE_SCRIPT,
      2,
      connectionCountKey(workspaceId, userId),
      usersKey(workspaceId),
      String(userId),
    );

    if (Number(emitted) === 1) {
      await publishPresenceEvent({
        type: "USER_OFFLINE",
        workspaceId,
        userId,
      });
    }
  }

  async function getOnlineUsers(workspaceId) {
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

  return {
    userOnline,
    userOffline,
    getOnlineUsers,
  };
}

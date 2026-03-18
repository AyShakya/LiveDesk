import redis from "../config/redis.js";

function getClientIp(req) {
  return (req.ip || req.headers["x-forwarded-for"] || "unknown").toString();
}

function normalizeSegment(value, fallback = "anonymous") {
  return (value || fallback)
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._:-]/g, "_")
    .slice(0, 120);
}

async function incrementWindow(key, windowMs) {
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.pexpire(key, windowMs);
  }

  const ttlMs = await redis.pttl(key);
  return {
    count,
    ttlMs: ttlMs > 0 ? ttlMs : windowMs,
  };
}

export function createRateLimiter({
  namespace,
  windowMs,
  maxRequests,
  keyGenerator,
  message = "Too many requests, please try again later.",
}) {
  if (!namespace || !windowMs || !maxRequests || !keyGenerator) {
    throw new Error("RATE_LIMIT_CONFIG_INVALID");
  }

  return async function rateLimitMiddleware(req, res, next) {
    try {
      const rawKey = keyGenerator(req);
      const key = `rate_limit:${namespace}:${normalizeSegment(rawKey)}`;
      const { count, ttlMs } = await incrementWindow(key, windowMs);

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(maxRequests - count, 0)
      );
      res.setHeader("X-RateLimit-Reset", Math.ceil(Date.now() / 1000 + ttlMs / 1000));

      if (count > maxRequests) {
        res.setHeader("Retry-After", Math.ceil(ttlMs / 1000));
        return res.status(429).json({ error: message });
      }

      next();
    } catch (error) {
      console.error("Rate limiter failed", error);
      next();
    }
  };
}

export const apiRateLimiter = createRateLimiter({
  namespace: "api",
  windowMs: 60 * 1000,
  maxRequests: 120,
  keyGenerator: (req) => getClientIp(req),
  message: "Too many requests from this IP, please slow down.",
});

export const authRateLimiter = createRateLimiter({
  namespace: "auth",
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    const email = normalizeSegment(req.body?.email, "unknown-email");
    return `${ip}:${email}`;
  },
  message: "Too many authentication attempts, please try again later.",
});

export const workspaceJoinRateLimiter = createRateLimiter({
  namespace: "workspace-join",
  windowMs: 5 * 60 * 1000,
  maxRequests: 15,
  keyGenerator: (req) => `${getClientIp(req)}:${req.user?.id || "anonymous"}`,
  message: "Too many workspace join attempts, please try again later.",
});

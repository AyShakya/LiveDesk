import express from "express";
import { register, login } from "./auth.service.js";
import { findUserById } from "./auth.repo.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authRateLimiter } from "../../middlewares/rate-limit.middleware.js";

const router = express.Router();

router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const result = await register({ email, password, name });
    res.status(201).json({ ...result, instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({ error: "User already exists", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Internal server error", instanceId: res.locals.instanceId });
  }
});

router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.json({ ...result, instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid credentials", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Internal server error", instanceId: res.locals.instanceId });
  }
});

router.get("/me", requireAuth, async (req, res) => {
    const user = await findUserById(req.user.id);
    res.json({ ...user, instanceId: res.locals.instanceId });
});

export default router;
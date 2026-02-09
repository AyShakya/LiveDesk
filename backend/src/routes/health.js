import { Router } from "express";
import pool from "../configpostgres.js";
import redis from "../config/redis.js";

const router = Router();

router.get("/health", async (req, res) => {
    try {
    await pool.query("SELECT 1");
    await redis.ping();

    res.json({
      status: "ok",
      postgres: "connected",
      redis: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
});

export default router;
import express from "express";
import cors from "cors";
import { WS_SERVER_INSTANCE_ID } from "./websocket/ws.server.js";

import healthRouter from "./routes/health.js";
import authRouter from "./modules/auth/auth.controller.js";
import workspaceRouter from "./modules/workspace/workspace.controller.js";
import documentRouter from "./modules/document/document.controller.js";
import presenceRouter from "./modules/presence/presence.controller.js";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware.js";

const app = express();
app.set("trust proxy", 1);

// Middleware to attach instance ID
app.use((req, res, next) => {
  res.locals.instanceId = WS_SERVER_INSTANCE_ID;
  res.set("X-Instance-ID", WS_SERVER_INSTANCE_ID);
  next();
});

app.use(express.json({
  verify: (req, res, buf) => {
    if (!buf || buf.length === 0) {
      req.body = {};
    }
  }
}));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

//Routes
app.use("/health", healthRouter);
app.use(apiRateLimiter);
app.use("/auth", authRouter);
app.use("/workspaces", workspaceRouter);
app.use("/documents", documentRouter);
app.use("/presence", presenceRouter);

export default app;
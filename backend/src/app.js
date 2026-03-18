import express from "express";
import cors from "cors";

import healthRouter from "./routes/health.js";
import authRouter from "./modules/auth/auth.controller.js";
import workspaceRouter from "./modules/workspace/workspace.controller.js";
import documentRouter from "./modules/document/document.controller.js";
import presenceRouter from "./modules/presence/presence.controller.js";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware.js";

const app = express();
app.set("trust proxy", 1);
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

//Routes
app.use("/health", healthRouter);
app.use(apiRateLimiter);
app.use("/auth", authRouter);
app.use("/workspaces", workspaceRouter);
app.use("/documents", documentRouter);
app.use("/presence", presenceRouter);

export default app;
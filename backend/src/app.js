import express from "express";

import healthRouter from "./routes/health.js";
import authRouter from "./modules/auth/auth.controller.js";
import workspaceRouter from "./modules/workspace/workspace.controller.js";
import documentRouter from "./modules/document/document.controller.js";

const app = express();
app.use(express.json({
  verify: (req, res, buf) => {
    if (!buf || buf.length === 0) {
      req.body = {};
    }
  }
}));

//Routes
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/workspaces", workspaceRouter);
app.use("/documents", documentRouter);

export default app;
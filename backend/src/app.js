import express from "express";

import healthRouter from "./routes/health.js";
import authRouter from "./modules/auth/auth.controller.js";

const app = express();
app.use(express.json());

//Routes
app.use("/health", healthRouter);
app.use("/auth", authRouter);

export default app;
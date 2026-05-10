import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  userOnline,
  userOffline,
  getOnlineUsers,
} from "./presence.service.js";

const router = express.Router();

router.post("/online", requireAuth, async (req, res) => {
  const { workspaceId } = req.body;
  await userOnline(workspaceId, req.user.id);
  res.json({ status: "online", instanceId: res.locals.instanceId });
});

router.post("/offline", requireAuth, async (req, res) => {
  const { workspaceId } = req.body;
  await userOffline(workspaceId, req.user.id);
  res.json({ status: "offline", instanceId: res.locals.instanceId });
});

router.get("/:workspaceId", requireAuth, async (req, res) => {
  const users = await getOnlineUsers(req.params.workspaceId);
  res.json({ users, instanceId: res.locals.instanceId });
});

export default router;
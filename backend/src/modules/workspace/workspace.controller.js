import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { workspaceJoinRateLimiter } from "../../middlewares/rate-limit.middleware.js";
import {
  createWorkspaceForUser,
  getMyWorkspaces,
  joinWorkspace,
  getWorkspaceMembers,
  updateWorkspaceForUser,
  deleteWorkspaceForUser,
} from "./workspace.service.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const workspace = await createWorkspaceForUser({
      name,
      userId: req.user.id,
    });
    res.status(201).json({ ...workspace, instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "INVALID_NAME") {
      return res.status(400).json({ error: "Workspace name required", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Failed to create workspace", instanceId: res.locals.instanceId });
  }
});

router.post(
  "/join",
  requireAuth,
  workspaceJoinRateLimiter,
  async (req, res) => {
    try {
      const { inviteCode } = req.body;
      const workspace = await joinWorkspace({
        inviteCode,
        userId: req.user.id,
      });
      res.status(200).json({ ...workspace, instanceId: res.locals.instanceId });
    } catch (err) {
      if (err.message === "WORKSPACE_NOT_FOUND") {
        return res.status(404).json({ error: "Workspace not found", instanceId: res.locals.instanceId });
      }
      res.status(500).json({ error: "Failed to join workspace", instanceId: res.locals.instanceId });
    }
  },
);

router.get("/", requireAuth, async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /workspaces called for user ${req.user.id}`);
  try {
    const workspaces = await getMyWorkspaces(req.user.id);
    console.log(`[${new Date().toISOString()}] Returning ${workspaces.length} workspaces for user ${req.user.id}`);
    res.status(200).json({ workspaces, instanceId: res.locals.instanceId });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching workspaces for user ${req.user.id}:`, err);
    res.status(500).json({ error: "Failed to fetch workspaces", instanceId: res.locals.instanceId });
  }
});

router.get("/:workspaceId/members", requireAuth, async (req, res) => {
  try {
    const members = await getWorkspaceMembers(
      req.params.workspaceId,
      req.user.id,
    );
    res.json({ members, instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not a workspace member", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Failed to fetch members", instanceId: res.locals.instanceId });
  }
});

router.put("/:workspaceId", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const workspace = await updateWorkspaceForUser({
      workspaceId: req.params.workspaceId,
      name,
      userId: req.user.id,
    });
    res.json({ ...workspace, instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not allowed", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Failed to update workspace", instanceId: res.locals.instanceId });
  }
});

router.delete("/:workspaceId", requireAuth, async (req, res) => {
  try {
    await deleteWorkspaceForUser({
      workspaceId: req.params.workspaceId,
      userId: req.user.id,
    });
    res.status(204).json({ instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not allowed", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Failed to delete workspace", instanceId: res.locals.instanceId });
  }
});

export default router;

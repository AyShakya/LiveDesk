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
    res.status(201).json(workspace);
  } catch (error) {
    if (err.message === "INVALID_NAME") {
      return res.status(400).json({ error: "Workspace name required" });
    }
    res.status(500).json({ error: "Failed to create workspace" });
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
      res.status(200).json(workspace);
    } catch (err) {
      if (err.message === "WORKSPACE_NOT_FOUND") {
        return res.status(404).json({ error: "Workspace not found" });
      }
      res.status(500).json({ error: "Failed to join workspace" });
    }
  },
);

router.get("/", requireAuth, async (req, res) => {
  const workspaces = await getMyWorkspaces(req.user.id);
  res.status(200).json(workspaces);
});

router.get("/:workspaceId/members", requireAuth, async (req, res) => {
  try {
    const members = await getWorkspaceMembers(
      req.params.workspaceId,
      req.user.id,
    );
    res.json(members);
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not a workspace member" });
    }
    res.status(500).json({ error: "Failed to fetch members" });
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
    res.json(workspace);
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not allowed" });
    }
    res.status(500).json({ error: "Failed to update workspace" });
  }
});

router.delete("/:workspaceId", requireAuth, async (req, res) => {
  try {
    await deleteWorkspaceForUser({
      workspaceId: req.params.workspaceId,
      userId: req.user.id,
    });
    res.status(204).end();
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not allowed" });
    }
    res.status(500).json({ error: "Failed to delete workspace" });
  }
});

export default router;

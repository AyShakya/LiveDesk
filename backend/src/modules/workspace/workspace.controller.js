import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createWorkspaceForUser, getMyWorkspaces, joinWorkspace } from "./workspace.service.js";

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
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

router.post("/join", requireAuth, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const workspace = await joinWorkspace({ inviteCode, userId: req.user.id });
    res.status(200).json(workspace);
  } catch (err) {
    if (err.message === "WORKSPACE_NOT_FOUND") {
      return res.status(404).json({ error: "Workspace not found" });
    }
    res.status(500).json({ error: "Failed to join workspace" });
  }
});

router.get("/", requireAuth, async (req, res) => {
    const workspaces = await getMyWorkspaces(req.user.id);
    res.status(200).json(workspaces);
});

export default router;
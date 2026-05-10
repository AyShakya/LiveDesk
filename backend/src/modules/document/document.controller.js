import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createDoc, getDoc, listDocs, updateDocs, deleteDoc } from "./document.service.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { workspaceId, title } = req.body;
    const doc = await createDoc({
      workspaceId,
      title,
      userId: req.user.id,
    });
    res.status(201).json({ ...doc, instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not a workspace member", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Failed to create document", instanceId: res.locals.instanceId });
  }
});

router.get("/workspace/:workspaceId", requireAuth, async (req, res) => {
    try {
    const docs = await listDocs({
      workspaceId: req.params.workspaceId,
      userId: req.user.id,
    });
    res.json({ docs, instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not a workspace member", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Failed to fetch documents", instanceId: res.locals.instanceId });
  }
});

router.get("/:docId", requireAuth, async (req, res) => {
    try {
    const doc = await getDoc({
      docId: req.params.docId,
      userId: req.user.id,
    });
    res.json({ ...doc, instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Document not found", instanceId: res.locals.instanceId });
    }
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Access denied", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Failed to fetch document", instanceId: res.locals.instanceId });
  }
});

router.put("/:docId", requireAuth, async (req, res) => {
    try {
    const doc = await updateDocs({
      docId: req.params.docId,
      title: req.body.title,
      content: req.body.content,
      userId: req.user.id,
    });
    res.json({ ...doc, instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Document not found", instanceId: res.locals.instanceId });
    }
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Access denied", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Failed to update document", instanceId: res.locals.instanceId });
  }
});

router.delete("/:docId", requireAuth, async (req, res) => {
  try {
    await deleteDoc({ docId: req.params.docId, userId: req.user.id });
    res.status(204).json({ instanceId: res.locals.instanceId });
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Document not found", instanceId: res.locals.instanceId });
    }
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Access denied", instanceId: res.locals.instanceId });
    }
    res.status(500).json({ error: "Failed to delete document", instanceId: res.locals.instanceId });
  }
});

export default router;
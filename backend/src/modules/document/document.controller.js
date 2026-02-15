import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createDoc, getDoc, listDocs, updateDocs } from "./document.service.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { workspaceId, title } = req.body;
    const doc = await createDoc({
      workspaceId,
      title,
      userId: req.user.id,
    });
    res.status(201).json(doc);
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not a workspace member" });
    }
    res.status(500).json({ error: "Failed to create document" });
  }
});

router.get("/workspace/:workspaceId", requireAuth, async (req, res) => {
    try {
    const docs = await listDocs({
      workspaceId: req.params.workspaceId,
      userId: req.user.id,
    });
    res.json(docs);
  } catch (err) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Not a workspace member" });
    }
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.get("/:docId", requireAuth, async (req, res) => {
    try {
    const doc = await getDoc({
      docId: req.params.docId,
      userId: req.user.id,
    });
    res.json(doc);
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Document not found" });
    }
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Access denied" });
    }
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

router.put("/:docId", requireAuth, async (req, res) => {
    try {
    const doc = await updateDocs({
      docId: req.params.docId,
      content: req.body.content,
      userId: req.user.id,
    });
    res.json(doc);
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Document not found" });
    }
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Access denied" });
    }
    res.status(500).json({ error: "Failed to update document" });
  }
});

export default router;
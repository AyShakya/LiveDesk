import pool from "../../config/postgres.js";
import { documentCache } from "../../websocket/cacheModule.js";

export function startDocumentWorkers() {
  setInterval(() => {
    const now = Date.now();
    const IDLE_LIMIT = 10 * 60 * 1000;

    for (const [docId, doc] of documentCache) {
      if (now - doc.lastAccess > IDLE_LIMIT) {
        documentCache.delete(docId);
      }
    }
  }, 600000);
  setInterval(async () => {
    const BATCH_LIMIT = 100;
    let processed = 0;

    for (const [docId, doc] of documentCache) {
      if (!doc.dirty) continue;

      try {
        await pool.query(
          `UPDATE documents
         SET content=$1, updated_at=NOW()
         WHERE id=$2`,
          [doc.content, docId],
        );

        doc.dirty = false;

        processed++;

        if (processed >= BATCH_LIMIT) {
          break;
        }
      } catch (err) {
        console.error("Failed to persist document", err);
      }
    }
  }, 5000);
}

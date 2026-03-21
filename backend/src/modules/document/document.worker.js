import { documentCache, flushAndDeleteCachedDocument, flushCachedDocument } from "../../websocket/cacheModule.js";

export function startDocumentWorkers() {
  setInterval(() => {
    const now = Date.now();
    const IDLE_LIMIT = 10 * 60 * 1000;

    for (const [docId, doc] of documentCache) {
      if (now - doc.lastAccess > IDLE_LIMIT) {
        void flushAndDeleteCachedDocument(docId).catch((err) => {
          console.error("Failed to flush idle document", err);
        });
      }
    }
  }, 600000);
  setInterval(async () => {
    const BATCH_LIMIT = 100;
    let processed = 0;

    for (const [docId, doc] of documentCache) {
      if (!doc.dirty) continue;

      try {
        await flushCachedDocument(docId);

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

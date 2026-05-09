export const documentCache = new Map();

export function applyDocumentEventToCache(event) {
	if (!event || !event.docId || typeof event.content !== "string") {
		return;
	}

	documentCache.set(String(event.docId), {
		content: event.content,
		lastAccess: Date.now(),
		dirty: false,
	});
}
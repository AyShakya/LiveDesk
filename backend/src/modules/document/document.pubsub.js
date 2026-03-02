import Redis from "ioredis";

const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const CHANNEL = "document_events";

export function publishDocumentEvent(event) {
  pub.publish(CHANNEL, JSON.stringify(event));
}

export function subscribeToDocumentEvents(handler) {
  const sub = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });

  sub.subscribe(CHANNEL);

  sub.on("message", (_, message) => {
    handler(JSON.parse(message));
  });
}
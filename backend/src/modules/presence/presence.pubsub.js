import Redis from "ioredis";

const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const sub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const CHANNEL = "presence_events";

export function publishPresenceEvent(event) {
  pub.publish(CHANNEL, JSON.stringify(event));
}

export function subscribeToPresenceEvents(handler) {
  sub.subscribe(CHANNEL);

  sub.on("message", (channel, message) => {
    if (channel === CHANNEL) {
      handler(JSON.parse(message));
    }
  });
}
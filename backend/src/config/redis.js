import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
})

redis.on("connect", () => {
    console.log("Connected to the Redis server");
})

redis.on("error", (err) => {
    console.error("Error connecting to the Redis server:", err);
})

export default redis;
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import pool from "./config/postgres.js";
import redis from "./config/redis.js"

const PORT = process.env.PORT;

async function startServer() {
    try {
        await pool.query("SELECT 1");
        await redis.ping();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

startServer();
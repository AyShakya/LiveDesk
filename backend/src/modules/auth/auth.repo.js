import pool from "../../config/postgres.js";

export async function createUser(email, passwordHash, name) {
    const query = `
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, created_at
    `;
    const {rows} = await pool.query(query, [email, passwordHash, name]);
    return rows[0];
}

export async function findUserByEmail(email) {
    const query = `
    SELECT id, email, password_hash, name
    FROM users
    WHERE email = $1`;
    const {rows} = await pool.query(query, [email]);
    return rows[0];
}

export async function findUserById(id){
    const query = `
    SELECT id, email, name, created_at
    FROM users
    WHERE id = $1`;
    const {rows} = await pool.query(query, [id]);
    return rows[0];
}
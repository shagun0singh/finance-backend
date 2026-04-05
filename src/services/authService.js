const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");

function userRowToPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    created_at: row.created_at,
  };
}

function registerUser(name, email, password, role) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = db
    .prepare("SELECT id FROM users WHERE lower(email) = ?")
    .get(normalizedEmail);
  if (existing) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES (?, ?, ?, ?, 'active')`
    )
    .run(name.trim(), normalizedEmail, passwordHash, role);

  const row = db
    .prepare(
      "SELECT id, name, email, role, status, created_at FROM users WHERE id = ?"
    )
    .get(result.lastInsertRowid);

  return userRowToPublic(row);
}

function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const row = db
    .prepare("SELECT * FROM users WHERE lower(email) = ?")
    .get(normalizedEmail);

  if (!row) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  if (row.status !== "active") {
    const err = new Error("Account is inactive");
    err.status = 403;
    throw err;
  }

  const valid = bcrypt.compareSync(password, row.password_hash);
  if (!valid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET is not configured");
    err.status = 500;
    throw err;
  }

  const token = jwt.sign(
    { id: row.id, email: row.email, role: row.role },
    secret,
    { expiresIn: "24h" }
  );

  return { token, user: userRowToPublic(row) };
}

module.exports = { registerUser, loginUser };

const db = require("../db/database");

const PUBLIC_FIELDS =
  "id, name, email, role, status, created_at";

function rowToUser(row) {
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

function notFound() {
  const err = new Error("User not found");
  err.status = 404;
  throw err;
}

function getAllUsers() {
  return db
    .prepare(`SELECT ${PUBLIC_FIELDS} FROM users ORDER BY id ASC`)
    .all()
    .map(rowToUser);
}

function getUserById(id) {
  const row = db
    .prepare(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`)
    .get(id);
  if (!row) notFound();
  return rowToUser(row);
}

function updateUser(id, data) {
  getUserById(id);

  const { name, role, status } = data;

  if (role !== undefined) {
    if (!["viewer", "analyst", "admin"].includes(role)) {
      const err = new Error("Role must be viewer, analyst, or admin");
      err.status = 400;
      throw err;
    }
  }

  if (status !== undefined) {
    if (!["active", "inactive"].includes(status)) {
      const err = new Error("Status must be active or inactive");
      err.status = 400;
      throw err;
    }
  }

  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push("name = ?");
    values.push(String(name).trim());
  }
  if (role !== undefined) {
    updates.push("role = ?");
    values.push(role);
  }
  if (status !== undefined) {
    updates.push("status = ?");
    values.push(status);
  }

  if (updates.length === 0) {
    return getUserById(id);
  }

  values.push(id);
  db.prepare(
    `UPDATE users SET ${updates.join(", ")} WHERE id = ?`
  ).run(...values);

  return getUserById(id);
}

function deleteUser(id, requesterId) {
  getUserById(id);

  if (Number(id) === Number(requesterId)) {
    const err = new Error("You cannot delete your own account");
    err.status = 403;
    throw err;
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return { message: "User deleted successfully" };
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };

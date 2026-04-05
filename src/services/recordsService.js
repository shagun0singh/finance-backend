const db = require("../db/database");

function rowToRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    amount: row.amount,
    type: row.type,
    category: row.category,
    date: row.date,
    notes: row.notes,
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

function notFound() {
  const err = new Error("Record not found");
  err.status = 404;
  throw err;
}

function createRecord(data, createdBy) {
  const { amount, type, category, date, notes } = data;
  if (type !== "income" && type !== "expense") {
    const err = new Error("Type must be income or expense");
    err.status = 400;
    throw err;
  }

  const result = db
    .prepare(
      `INSERT INTO financial_records (amount, type, category, date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      amount,
      type,
      category,
      date,
      notes === undefined || notes === null ? null : notes,
      createdBy
    );

  return getRecordById(result.lastInsertRowid);
}

function getAllRecords(filters = {}) {
  const {
    type,
    category,
    startDate,
    endDate,
    page: pageRaw,
    limit: limitRaw,
  } = filters;

  const page = Math.max(1, parseInt(pageRaw, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(limitRaw, 10) || 10));

  const conditions = [];
  const params = [];

  if (type !== undefined && type !== null && type !== "") {
    if (type !== "income" && type !== "expense") {
      const err = new Error("Filter type must be income or expense");
      err.status = 400;
      throw err;
    }
    conditions.push("type = ?");
    params.push(type);
  }

  if (category !== undefined && category !== null && category !== "") {
    conditions.push("category = ?");
    params.push(String(category));
  }

  if (startDate !== undefined && startDate !== null && startDate !== "") {
    conditions.push("date >= ?");
    params.push(String(startDate));
  }

  if (endDate !== undefined && endDate !== null && endDate !== "") {
    conditions.push("date <= ?");
    params.push(String(endDate));
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = db
    .prepare(`SELECT COUNT(*) AS total FROM financial_records ${where}`)
    .get(...params);
  const total = countRow.total;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const rows = db
    .prepare(
      `SELECT id, amount, type, category, date, notes, created_by, created_at
       FROM financial_records ${where}
       ORDER BY date DESC, id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  return {
    records: rows.map(rowToRecord),
    total,
    page,
    totalPages,
  };
}

function getRecordById(id) {
  const row = db
    .prepare(
      `SELECT id, amount, type, category, date, notes, created_by, created_at
       FROM financial_records WHERE id = ?`
    )
    .get(id);
  if (!row) notFound();
  return rowToRecord(row);
}

function updateRecord(id, data) {
  getRecordById(id);

  const allowed = ["amount", "type", "category", "date", "notes"];
  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    const val = data[key];
    if (val === undefined) continue;
    if (key === "type") {
      if (val !== "income" && val !== "expense") {
        const err = new Error("Type must be income or expense");
        err.status = 400;
        throw err;
      }
    }
    updates.push(`${key} = ?`);
    values.push(val);
  }

  if (updates.length === 0) {
    return getRecordById(id);
  }

  values.push(id);
  db.prepare(
    `UPDATE financial_records SET ${updates.join(", ")} WHERE id = ?`
  ).run(...values);

  return getRecordById(id);
}

function deleteRecord(id) {
  getRecordById(id);
  db.prepare("DELETE FROM financial_records WHERE id = ?").run(id);
  return { message: "Financial record deleted successfully" };
}

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};

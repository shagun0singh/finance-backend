require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "finance.db");
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

module.exports = db;

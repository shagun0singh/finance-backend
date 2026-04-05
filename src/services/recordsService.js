const mongoose = require("mongoose");
const Record = require("../models/Record");

function docToRecord(doc) {
  if (!doc) return null;
  const d = doc.date instanceof Date ? doc.date : new Date(doc.date);
  const dateStr = Number.isNaN(d.getTime())
    ? String(doc.date)
    : d.toISOString().slice(0, 10);
  return {
    id: doc._id.toString(),
    amount: doc.amount,
    type: doc.type,
    category: doc.category,
    date: dateStr,
    notes: doc.notes,
    created_by: doc.createdBy ? doc.createdBy.toString() : null,
    created_at: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : undefined,
  };
}

function notFound() {
  const err = new Error("Record not found");
  err.status = 404;
  throw err;
}

function invalidId() {
  const err = new Error("Record not found");
  err.status = 404;
  throw err;
}

async function createRecord(data, createdBy) {
  const { amount, type, category, date, notes } = data;
  if (type !== "income" && type !== "expense") {
    const err = new Error("Type must be income or expense");
    err.status = 400;
    throw err;
  }

  const dateVal =
    typeof date === "string" && !date.includes("T")
      ? new Date(`${date}T12:00:00.000Z`)
      : new Date(date);

  const record = new Record({
    amount,
    type,
    category,
    date: dateVal,
    notes: notes === undefined || notes === null ? undefined : notes,
    createdBy,
  });
  await record.save();
  return docToRecord(record.toObject());
}

async function getAllRecords(filters = {}) {
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

  const query = {};

  if (type !== undefined && type !== null && type !== "") {
    if (type !== "income" && type !== "expense") {
      const err = new Error("Filter type must be income or expense");
      err.status = 400;
      throw err;
    }
    query.type = type;
  }

  if (category !== undefined && category !== null && category !== "") {
    query.category = String(category);
  }

  if (startDate !== undefined && startDate !== null && startDate !== "") {
    query.date = query.date || {};
    query.date.$gte = new Date(`${String(startDate)}T00:00:00.000Z`);
  }

  if (endDate !== undefined && endDate !== null && endDate !== "") {
    query.date = query.date || {};
    query.date.$lte = new Date(`${String(endDate)}T23:59:59.999Z`);
  }

  const total = await Record.countDocuments(query);
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await Record.find(query)
    .sort({ date: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    records: docs.map(docToRecord),
    total,
    page,
    totalPages,
  };
}

async function getRecordById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) invalidId();
  const doc = await Record.findById(id).lean();
  if (!doc) notFound();
  return docToRecord(doc);
}

async function updateRecord(id, data) {
  await getRecordById(id);

  const allowed = ["amount", "type", "category", "date", "notes"];
  const patch = {};

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
    if (key === "date") {
      patch[key] =
        typeof val === "string" && !val.includes("T")
          ? new Date(`${val}T12:00:00.000Z`)
          : new Date(val);
    } else {
      patch[key] = val;
    }
  }

  if (Object.keys(patch).length === 0) {
    return getRecordById(id);
  }

  const updated = await Record.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  }).lean();
  if (!updated) notFound();
  return docToRecord(updated);
}

async function deleteRecord(id) {
  await getRecordById(id);
  await Record.findByIdAndDelete(id);
  return { message: "Financial record deleted successfully" };
}

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};

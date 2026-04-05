const recordsService = require("../services/recordsService");

async function createRecord(req, res, next) {
  try {
    const { amount, type, category, date, notes } = req.body;
    const record = await recordsService.createRecord(
      { amount, type, category, date, notes },
      req.user.id
    );
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
}

async function getAllRecords(req, res, next) {
  try {
    const { type, category, startDate, endDate, page, limit } = req.query;
    const result = await recordsService.getAllRecords({
      type,
      category,
      startDate,
      endDate,
      page,
      limit,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getRecordById(req, res, next) {
  try {
    const { id } = req.params;
    const record = await recordsService.getRecordById(id);
    res.status(200).json(record);
  } catch (err) {
    next(err);
  }
}

async function updateRecord(req, res, next) {
  try {
    const { id } = req.params;
    const record = await recordsService.updateRecord(id, req.body);
    res.status(200).json(record);
  } catch (err) {
    next(err);
  }
}

async function deleteRecord(req, res, next) {
  try {
    const { id } = req.params;
    const result = await recordsService.deleteRecord(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};

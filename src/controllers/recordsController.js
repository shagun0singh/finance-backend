const recordsService = require("../services/recordsService");

function createRecord(req, res, next) {
  try {
    const { amount, type, category, date, notes } = req.body;
    const record = recordsService.createRecord(
      { amount, type, category, date, notes },
      req.user.id
    );
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
}

function getAllRecords(req, res, next) {
  try {
    const { type, category, startDate, endDate, page, limit } = req.query;
    const result = recordsService.getAllRecords({
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

function getRecordById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const record = recordsService.getRecordById(id);
    res.status(200).json(record);
  } catch (err) {
    next(err);
  }
}

function updateRecord(req, res, next) {
  try {
    const id = Number(req.params.id);
    const record = recordsService.updateRecord(id, req.body);
    res.status(200).json(record);
  } catch (err) {
    next(err);
  }
}

function deleteRecord(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = recordsService.deleteRecord(id);
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

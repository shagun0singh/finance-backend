const dashboardService = require("../services/dashboardService");

async function getSummary(req, res, next) {
  try {
    const data = await dashboardService.getSummary();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getCategoryTotals(req, res, next) {
  try {
    const data = await dashboardService.getCategoryTotals();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getRecentActivity(req, res, next) {
  try {
    const data = await dashboardService.getRecentActivity();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getMonthlyTrends(req, res, next) {
  try {
    const data = await dashboardService.getMonthlyTrends();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends,
};

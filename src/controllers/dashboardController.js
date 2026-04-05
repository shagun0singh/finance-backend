const dashboardService = require("../services/dashboardService");

function getSummary(req, res, next) {
  try {
    const data = dashboardService.getSummary();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

function getCategoryTotals(req, res, next) {
  try {
    const data = dashboardService.getCategoryTotals();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

function getRecentActivity(req, res, next) {
  try {
    const data = dashboardService.getRecentActivity();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

function getMonthlyTrends(req, res, next) {
  try {
    const data = dashboardService.getMonthlyTrends();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary, getCategoryTotals, getRecentActivity, getMonthlyTrends };

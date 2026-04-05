const db = require("../db/database");

function getSummary() {
  const incomeRow = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM financial_records WHERE type = 'income'`
    )
    .get();

  const expenseRow = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM financial_records WHERE type = 'expense'`
    )
    .get();

  const totalIncome = incomeRow.total;
  const totalExpenses = expenseRow.total;
  const netBalance = totalIncome - totalExpenses;

  return {
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    netBalance: parseFloat(netBalance.toFixed(2)),
  };
}

function getCategoryTotals() {
  const rows = db
    .prepare(
      `SELECT category, ROUND(SUM(amount), 2) AS total
       FROM financial_records
       GROUP BY category
       ORDER BY total DESC`
    )
    .all();

  return rows.map((r) => ({ category: r.category, total: r.total }));
}

function getRecentActivity() {
  return db
    .prepare(
      `SELECT id, amount, type, category, date, notes, created_by, created_at
       FROM financial_records
       ORDER BY created_at DESC
       LIMIT 5`
    )
    .all();
}

function getMonthlyTrends() {
  const rows = db
    .prepare(
      `SELECT
         strftime('%Y-%m', date) AS month,
         ROUND(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 2) AS income,
         ROUND(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 2) AS expenses
       FROM financial_records
       GROUP BY month
       ORDER BY month ASC`
    )
    .all();

  return rows.map((r) => ({
    month: r.month,
    income: r.income,
    expenses: r.expenses,
  }));
}

module.exports = { getSummary, getCategoryTotals, getRecentActivity, getMonthlyTrends };

const Record = require("../models/Record");

async function getSummary() {
  const [incomeAgg, expenseAgg] = await Promise.all([
    Record.aggregate([
      { $match: { type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Record.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalIncome = incomeAgg[0]?.total ?? 0;
  const totalExpenses = expenseAgg[0]?.total ?? 0;
  const netBalance = totalIncome - totalExpenses;

  return {
    totalIncome: parseFloat(Number(totalIncome).toFixed(2)),
    totalExpenses: parseFloat(Number(totalExpenses).toFixed(2)),
    netBalance: parseFloat(Number(netBalance).toFixed(2)),
  };
}

async function getCategoryTotals() {
  const rows = await Record.aggregate([
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        total: { $round: ["$total", 2] },
      },
    },
  ]);

  return rows.map((r) => ({ category: r.category, total: r.total }));
}

async function getRecentActivity() {
  const docs = await Record.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return docs.map((row) => {
    const d =
      row.date instanceof Date ? row.date : new Date(row.date);
    const dateStr = Number.isNaN(d.getTime())
      ? String(row.date)
      : d.toISOString().slice(0, 10);
    return {
      id: row._id.toString(),
      amount: row.amount,
      type: row.type,
      category: row.category,
      date: dateStr,
      notes: row.notes,
      created_by: row.createdBy ? row.createdBy.toString() : null,
      created_at: row.createdAt
        ? new Date(row.createdAt).toISOString()
        : undefined,
    };
  });
}

async function getMonthlyTrends() {
  const rows = await Record.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expenses: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        month: "$_id",
        income: { $round: ["$income", 2] },
        expenses: { $round: ["$expenses", 2] },
      },
    },
  ]);

  return rows.map((r) => ({
    month: r.month,
    income: r.income,
    expenses: r.expenses,
  }));
}

module.exports = {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends,
};

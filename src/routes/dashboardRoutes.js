const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

const guard = [authenticateToken, authorizeRoles("analyst", "admin")];

router.get("/summary",    ...guard, dashboardController.getSummary);
router.get("/categories", ...guard, dashboardController.getCategoryTotals);
router.get("/recent",     ...guard, dashboardController.getRecentActivity);
router.get("/trends",     ...guard, dashboardController.getMonthlyTrends);

module.exports = router;

const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const recordsController = require("../controllers/recordsController");

const router = express.Router();

const dateYmd = body("date")
  .matches(/^\d{4}-\d{2}-\d{2}$/)
  .withMessage("Date must be YYYY-MM-DD")
  .custom((value) => {
    const d = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(d.getTime());
  })
  .withMessage("Date must be a valid calendar date");

function isPositiveNumber(value) {
  const n = typeof value === "number" ? value : parseFloat(value);
  return !Number.isNaN(n) && n > 0;
}

const postValidators = [
  body("amount")
    .custom(isPositiveNumber)
    .withMessage("Amount must be a positive number"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  dateYmd,
  body("notes").optional().isString(),
];

const putValidators = [
  body("amount")
    .optional()
    .custom(isPositiveNumber)
    .withMessage("Amount must be a positive number"),
  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),
  body("date")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be YYYY-MM-DD")
    .custom((value) => {
      const d = new Date(`${value}T12:00:00Z`);
      return !Number.isNaN(d.getTime());
    })
    .withMessage("Date must be a valid calendar date"),
  body("notes").optional().isString(),
];

const idParam = param("id").isMongoId().withMessage("Invalid record id");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join("; ");
    return res.status(400).json({
      error: true,
      message,
      status: 400,
    });
  }
  next();
}

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  postValidators,
  handleValidation,
  recordsController.createRecord
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("viewer", "analyst", "admin"),
  recordsController.getAllRecords
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("viewer", "analyst", "admin"),
  idParam,
  handleValidation,
  recordsController.getRecordById
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  idParam,
  putValidators,
  handleValidation,
  recordsController.updateRecord
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  idParam,
  handleValidation,
  recordsController.deleteRecord
);

module.exports = router;

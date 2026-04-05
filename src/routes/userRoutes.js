const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

const adminOnly = [authenticateToken, authorizeRoles("admin")];

const idParam = param("id").isMongoId().withMessage("Invalid user id");

const putValidators = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),
  body("role")
    .optional()
    .isIn(["viewer", "analyst", "admin"])
    .withMessage("Role must be viewer, analyst, or admin"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join("; ");
    return res.status(400).json({ error: true, message, status: 400 });
  }
  next();
}

router.get("/",    ...adminOnly, userController.getAllUsers);

router.get("/:id", ...adminOnly, idParam, handleValidation,
  userController.getUserById);

router.put("/:id", ...adminOnly, idParam, putValidators, handleValidation,
  userController.updateUser);

router.delete("/:id", ...adminOnly, idParam, handleValidation,
  userController.deleteUser);

module.exports = router;

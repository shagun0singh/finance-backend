const { registerUser, loginUser } = require("../services/authService");

function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const user = registerUser(name, email, password, role);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };

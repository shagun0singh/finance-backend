const userService = require("../services/userService");

function getAllUsers(req, res, next) {
  try {
    const users = userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

function getUserById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = userService.getUserById(id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

function updateUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = userService.updateUser(id, req.body);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = userService.deleteUser(id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };

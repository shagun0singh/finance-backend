const mongoose = require("mongoose");
const User = require("../models/User");

function docToUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    created_at: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : undefined,
  };
}

function notFound() {
  const err = new Error("User not found");
  err.status = 404;
  throw err;
}

async function getAllUsers() {
  const docs = await User.find()
    .select("-password_hash")
    .sort({ _id: 1 })
    .lean();
  return docs.map(docToUser);
}

async function getUserById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();
  const doc = await User.findById(id).select("-password_hash").lean();
  if (!doc) notFound();
  return docToUser(doc);
}

async function updateUser(id, data) {
  await getUserById(id);

  const { name, role, status } = data;

  if (role !== undefined) {
    if (!["viewer", "analyst", "admin"].includes(role)) {
      const err = new Error("Role must be viewer, analyst, or admin");
      err.status = 400;
      throw err;
    }
  }

  if (status !== undefined) {
    if (!["active", "inactive"].includes(status)) {
      const err = new Error("Status must be active or inactive");
      err.status = 400;
      throw err;
    }
  }

  const patch = {};
  if (name !== undefined) patch.name = String(name).trim();
  if (role !== undefined) patch.role = role;
  if (status !== undefined) patch.status = status;

  if (Object.keys(patch).length === 0) {
    return getUserById(id);
  }

  const updated = await User.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  })
    .select("-password_hash")
    .lean();
  if (!updated) notFound();
  return docToUser(updated);
}

async function deleteUser(id, requesterId) {
  await getUserById(id);

  if (String(id) === String(requesterId)) {
    const err = new Error("You cannot delete your own account");
    err.status = 403;
    throw err;
  }

  await User.findByIdAndDelete(id);
  return { message: "User deleted successfully" };
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };

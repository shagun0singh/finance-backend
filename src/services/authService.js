const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function userToPublic(doc) {
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

async function registerUser(name, email, password, role) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role,
      status: "active",
    });
  } catch (e) {
    if (e.code === 11000) {
      const err = new Error("Email already registered");
      err.status = 409;
      throw err;
    }
    throw e;
  }

  return userToPublic(user);
}

async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  if (user.status !== "active") {
    const err = new Error("Account is inactive");
    err.status = 403;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET is not configured");
    err.status = 500;
    throw err;
  }

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    secret,
    { expiresIn: "24h" }
  );

  return { token, user: userToPublic(user) };
}

module.exports = { registerUser, loginUser };

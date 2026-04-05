require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./database");
const User = require("../models/User");

async function main() {
  await connectDB();

  const adminEmail = "admin@finance.com";
  const existing = await User.findOne({
    email: adminEmail.toLowerCase(),
  });

  if (!existing) {
    const passwordHash = bcrypt.hashSync("admin123", 10);
    await User.create({
      name: "Admin",
      email: adminEmail.toLowerCase(),
      password_hash: passwordHash,
      role: "admin",
      status: "active",
    });
    console.log("Seeded default admin:", adminEmail);
  } else {
    console.log("Admin user already exists, skipping seed.");
  }

  await mongoose.disconnect();
  console.log("Init complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

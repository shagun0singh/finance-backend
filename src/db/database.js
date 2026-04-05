const mongoose = require("mongoose");
require("dotenv").config();

/** Log cluster host only (no password) for debugging deploys. */
function mongoHostHint(uri) {
  const m = String(uri).match(/@([^/?]+)/);
  return m ? m[1] : "(unparseable URI — check format)";
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is not set. Add it in Render → Environment (and redeploy)."
    );
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15_000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    const hint = mongoHostHint(process.env.MONGODB_URI);
    console.error("MongoDB connection failed. Cluster host:", hint);
    console.error("Message:", err.message || err);
    if (err.reason) console.error("Reason:", err.reason);
    console.error(
      "Hints: Atlas → Network Access (allow 0.0.0.0/0 for testing); URL-encode special chars in DB password; variable name must be exactly MONGODB_URI."
    );
    process.exit(1);
  }
};

module.exports = connectDB;

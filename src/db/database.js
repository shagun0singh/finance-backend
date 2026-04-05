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
    console.log("[mongo] connecting… host:", mongoHostHint(process.env.MONGODB_URI));
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15_000,
      /** Prefer IPv4 — avoids some DNS/IPv6 timeouts on cloud hosts (e.g. Render → Atlas). */
      family: 4,
    });
    console.log("MongoDB connected");
  } catch (err) {
    const hint = mongoHostHint(process.env.MONGODB_URI);
    const msg = err.message || String(err);
    const lines = [
      "[mongo] CONNECTION FAILED",
      "cluster host: " + hint,
      "message: " + msg,
      err.reason ? "reason: " + err.reason : null,
      "fix: Atlas → Network Access → add 0.0.0.0/0; recopy URI from Atlas; URL-encode password if it has @ : / etc.",
    ].filter(Boolean);
    for (const line of lines) {
      console.error(line);
      console.log(line);
    }
    process.exit(1);
  }
};

module.exports = connectDB;

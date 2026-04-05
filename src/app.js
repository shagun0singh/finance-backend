require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const recordsRoutes = require("./routes/recordsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || "Internal Server Error",
    status,
  });
});

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use (EADDRINUSE). Another app or an old Node process is using it.\n` +
        `Fix: stop that process, or set PORT in .env to a free port (e.g. 3001).\n` +
        `Find PID: lsof -i :${port}`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});

module.exports = app;

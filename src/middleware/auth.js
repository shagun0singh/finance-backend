const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

  if (!token) {
    return res.status(401).json({
      error: true,
      message: "Access token required",
      status: 401,
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      error: true,
      message: "JWT_SECRET is not configured",
      status: 500,
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({
      error: true,
      message: "Invalid or expired token",
      status: 403,
    });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: "Insufficient permissions",
        status: 403,
      });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };

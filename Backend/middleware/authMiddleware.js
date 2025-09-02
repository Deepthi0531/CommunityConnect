const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.user = decoded; // will contain { id: user.id }
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });
  try { req.user = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: "Invalid token" }); }
};
module.exports = authMiddleware;

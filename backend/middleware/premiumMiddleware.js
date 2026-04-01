// ============================================
// Premium Middleware
// Sirf premium users AI features use kar sakein
// ============================================

const pool = require("../config/db");

const premiumMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Login required" });

    const result = await pool.query(
      "SELECT is_premium, premium_expires_at FROM users WHERE id = $1",
      [userId]
    );

    if (!result.rows.length) return res.status(401).json({ message: "User not found" });

    const { is_premium, premium_expires_at } = result.rows[0];

    // Check premium valid hai ya expire ho gaya
    const isActive =
      is_premium &&
      (!premium_expires_at || new Date(premium_expires_at) > new Date());

    if (!isActive) {
      return res.status(403).json({
        success: false,
        isPremiumRequired: true,
        message: "Yeh feature sirf Premium users ke liye hai! Upgrade karo.",
      });
    }

    req.user.isPremium = true;
    next();
  } catch (err) {
    console.error("Premium check error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = premiumMiddleware;

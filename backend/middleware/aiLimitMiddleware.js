// ============================================
// AI Limit Middleware
// Free users: 5 AI searches per day
// Premium users: Unlimited
// ============================================
const pool = require("../config/db");

const FREE_DAILY_LIMIT = 5;

const aiLimitMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Login required" });

    // Check if premium
    const userRes = await pool.query(
      "SELECT is_premium, premium_expires_at FROM users WHERE id=$1",
      [userId]
    );
    if (!userRes.rows.length) return res.status(401).json({ message: "User not found" });

    const { is_premium, premium_expires_at } = userRes.rows[0];
    const isPremiumActive = is_premium && (!premium_expires_at || new Date(premium_expires_at) > new Date());

    // Premium = unlimited, skip limit check
    if (isPremiumActive) {
      req.user.isPremium = true;
      return next();
    }

    // Free user — check daily usage
    const today = new Date().toISOString().split("T")[0];
    const usageRes = await pool.query(
      "SELECT count FROM ai_usage WHERE user_id=$1 AND usage_date=$2",
      [userId, today]
    );

    const usedToday = usageRes.rows.length ? parseInt(usageRes.rows[0].count) : 0;
    const remaining = FREE_DAILY_LIMIT - usedToday;

    if (usedToday >= FREE_DAILY_LIMIT) {
      return res.status(403).json({
        success: false,
        isLimitReached: true,
        isPremiumRequired: false,
        usedToday,
        limit: FREE_DAILY_LIMIT,
        remaining: 0,
        message: `Daily limit reached! You have used all ${FREE_DAILY_LIMIT} free AI searches for today. Upgrade to Premium for unlimited access, or come back tomorrow.`,
      });
    }

    // Increment usage count
    await pool.query(
      `INSERT INTO ai_usage(user_id, usage_date, count)
       VALUES($1, $2, 1)
       ON CONFLICT(user_id, usage_date)
       DO UPDATE SET count = ai_usage.count + 1`,
      [userId, today]
    );

    // Attach info to request
    req.user.isPremium = false;
    req.user.aiUsage = { usedToday: usedToday + 1, remaining: remaining - 1, limit: FREE_DAILY_LIMIT };

    next();
  } catch (err) {
    console.error("AI limit middleware error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = aiLimitMiddleware;

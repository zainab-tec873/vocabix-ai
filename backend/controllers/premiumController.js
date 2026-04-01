const pool = require("../config/db");

// ─── GET /api/premium/status ─────────────────────────────────────────────────
exports.getStatus = async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT is_premium, premium_expires_at FROM users WHERE id=$1",
      [req.user.id]
    );
    const { is_premium, premium_expires_at } = r.rows[0];
    const isActive = is_premium && (!premium_expires_at || new Date(premium_expires_at) > new Date());
    res.json({
      success: true,
      isPremium: isActive,
      expiresAt: premium_expires_at,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ─── POST /api/premium/activate ──────────────────────────────────────────────
// Admin/manual activation (ya payment verify hone ke baad)
exports.activate = async (req, res) => {
  try {
    const { user_id, plan, transaction_id, payment_method, amount } = req.body;

    // Calculate expiry
    const now = new Date();
    const expires = new Date(now);
    if (plan === "yearly") expires.setFullYear(expires.getFullYear() + 1);
    else expires.setMonth(expires.getMonth() + 1);

    // User ko premium karo
    await pool.query(
      "UPDATE users SET is_premium=true, premium_expires_at=$1, updated_at=NOW() WHERE id=$2",
      [expires, user_id]
    );

    // Payment record save karo
    await pool.query(
      `INSERT INTO premium_payments(user_id, amount, payment_method, transaction_id, status, plan)
       VALUES($1, $2, $3, $4, 'completed', $5)`,
      [user_id, amount || 0, payment_method || "manual", transaction_id || "manual", plan || "monthly"]
    );

    res.json({
      success: true,
      message: `Premium activated until ${expires.toDateString()}`,
      expiresAt: expires,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Activation failed" });
  }
};

// ─── GET /api/premium/users (admin only) ─────────────────────────────────────
exports.getPremiumUsers = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT u.id, u.name, u.email, u.is_premium, u.premium_expires_at,
              COUNT(pp.id) as total_payments
       FROM users u
       LEFT JOIN premium_payments pp ON pp.user_id = u.id
       WHERE u.is_premium = true
       GROUP BY u.id
       ORDER BY u.premium_expires_at DESC`
    );
    res.json({ success: true, total: r.rows.length, data: r.rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ─── GET /api/premium/payments (admin only) ───────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT pp.*, u.name, u.email
       FROM premium_payments pp
       JOIN users u ON pp.user_id = u.id
       ORDER BY pp.created_at DESC
       LIMIT 100`
    );
    res.json({ success: true, total: r.rows.length, data: r.rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

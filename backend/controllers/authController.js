const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });
    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length > 0) return res.status(400).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const r = await pool.query(
      `INSERT INTO users(name,email,password,role,is_verified,created_at,updated_at,last_login)
       VALUES($1,$2,$3,'user',false,NOW(),NOW(),NOW()) RETURNING id,name,email,role`,
      [name, email, hashed]
    );
    const user = r.rows[0];
    // Init stats
    await pool.query(
      `INSERT INTO user_stats(user_id,xp,level,streak,last_active) VALUES($1,0,1,0,CURRENT_DATE) ON CONFLICT DO NOTHING`,
      [user.id]
    );
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err) { console.error(err); res.status(500).json({ message: "Registration failed" }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    const r = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (r.rows.length === 0) return res.status(400).json({ message: "Invalid email or password" });
    const user = r.rows[0];
    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ message: "Invalid email or password" });
    await pool.query("UPDATE users SET last_login=NOW() WHERE id=$1", [user.id]);
    // Update streak
    await updateStreak(user.id);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { console.error(err); res.status(500).json({ message: "Login failed" }); }
};

exports.getMe = async (req, res) => {
  try {
    const r = await pool.query("SELECT id,name,email,role,created_at FROM users WHERE id=$1", [req.user.id]);
    if (!r.rows.length) return res.status(404).json({ message: "User not found" });
    res.json({ user: r.rows[0] });
  } catch { res.status(500).json({ message: "Server error" }); }
};

async function updateStreak(userId) {
  try {
    const r = await pool.query("SELECT last_active, streak FROM user_stats WHERE user_id=$1", [userId]);
    if (!r.rows.length) {
      await pool.query("INSERT INTO user_stats(user_id,xp,level,streak,last_active) VALUES($1,0,1,1,CURRENT_DATE) ON CONFLICT DO NOTHING", [userId]);
      return;
    }
    const { last_active, streak } = r.rows[0];
    const today = new Date(); today.setHours(0,0,0,0);
    const last = new Date(last_active); last.setHours(0,0,0,0);
    const diff = (today - last) / (1000*60*60*24);
    let newStreak = streak;
    if (diff === 1) newStreak = streak + 1;
    else if (diff > 1) newStreak = 1;
    await pool.query("UPDATE user_stats SET streak=$1, last_active=CURRENT_DATE WHERE user_id=$2", [newStreak, userId]);
  } catch(e) { console.error("streak error:", e); }
}

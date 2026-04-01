const pool = require("../config/db");

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await pool.query("SELECT * FROM user_stats WHERE user_id=$1", [userId]);
    const favCount = await pool.query("SELECT COUNT(*) FROM favorites WHERE user_id=$1", [userId]);
    const searchCount = await pool.query("SELECT COUNT(*) FROM search_history WHERE user_id=$1", [userId]);
    // Activity heatmap: last 52 weeks
    const activity = await pool.query(
      `SELECT DATE(searched_at) as date, COUNT(*) as count FROM search_history WHERE user_id=$1 AND searched_at > NOW()-INTERVAL '365 days' GROUP BY DATE(searched_at) ORDER BY date`,
      [userId]
    );
    const s = stats.rows[0] || { xp:0, level:1, streak:0 };
    const levelNames = ["Beginner","Explorer","Learner","Scholar","Wordsmith","Linguist","Lexicon Master"];
    const levelName = levelNames[Math.min(s.level-1, levelNames.length-1)];
    const xpToNext = s.level * 100 - s.xp;
    res.json({
      success: true,
      data: {
        xp: s.xp, level: s.level, levelName, streak: s.streak,
        xpToNext: Math.max(0, xpToNext),
        xpProgress: Math.min(100, ((s.xp % 100) / 100) * 100),
        favorites: parseInt(favCount.rows[0].count),
        totalSearches: parseInt(searchCount.rows[0].count),
        activity: activity.rows,
      }
    });
  } catch(err) { console.error(err); res.status(500).json({ success:false }); }
};

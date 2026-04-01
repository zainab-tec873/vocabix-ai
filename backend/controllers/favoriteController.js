const pool = require("../config/db");

exports.getFavorites = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT f.id AS fav_id,w.id AS word_id,w.word,m.definition,m.part_of_speech,f.created_at
       FROM favorites f JOIN words w ON f.word_id=w.id LEFT JOIN meanings m ON m.word_id=w.id
       WHERE f.user_id=$1 ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    const map = new Map();
    for (const row of r.rows) {
      if (!map.has(row.word_id)) map.set(row.word_id, { fav_id:row.fav_id, word_id:row.word_id, word:row.word, meanings:[], created_at:row.created_at });
      if (row.definition) map.get(row.word_id).meanings.push({ definition:row.definition, part_of_speech:row.part_of_speech });
    }
    res.json({ success:true, data:[...map.values()] });
  } catch(err) { console.error(err); res.status(500).json({ success:false, message:"Server error" }); }
};

exports.addFavorite = async (req, res) => {
  try {
    const { word_id } = req.body;
    if (!word_id) return res.status(400).json({ message:"word_id required" });
    const ex = await pool.query("SELECT id FROM favorites WHERE user_id=$1 AND word_id=$2", [req.user.id, word_id]);
    if (ex.rows.length) return res.status(400).json({ message:"Already in favorites" });
    await pool.query("INSERT INTO favorites(user_id,word_id,created_at) VALUES($1,$2,NOW())", [req.user.id, word_id]);
    res.status(201).json({ success:true, message:"Added to favorites ⭐" });
  } catch(err) { console.error(err); res.status(500).json({ success:false }); }
};

exports.removeFavorite = async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM favorites WHERE user_id=$1 AND word_id=$2 RETURNING id", [req.user.id, req.params.word_id]);
    if (!r.rows.length) return res.status(404).json({ message:"Not found" });
    res.json({ success:true, message:"Removed" });
  } catch(err) { console.error(err); res.status(500).json({ success:false }); }
};

exports.checkFavorite = async (req, res) => {
  try {
    const r = await pool.query("SELECT id FROM favorites WHERE user_id=$1 AND word_id=$2", [req.user.id, req.params.word_id]);
    res.json({ isFavorite: r.rows.length > 0 });
  } catch { res.status(500).json({ isFavorite:false }); }
};

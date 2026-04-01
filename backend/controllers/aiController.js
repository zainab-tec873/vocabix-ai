const aiService = require("../services/aiService");
const pool = require("../config/db");

const FREE_LIMIT = 5;

// ─── Helper: Get from cache ──────────────────────────────────────────────────
async function getCached(word, type) {
  try {
    const r = await pool.query("SELECT content FROM ai_cache WHERE word=$1 AND type=$2", [word.toLowerCase(), type]);
    return r.rows.length ? r.rows[0].content : null;
  } catch { return null; }
}

// ─── Helper: Save to cache ───────────────────────────────────────────────────
async function saveCache(word, type, content) {
  try {
    await pool.query(
      `INSERT INTO ai_cache(word,type,content) VALUES($1,$2,$3) ON CONFLICT(word,type) DO UPDATE SET content=$3`,
      [word.toLowerCase(), type, content]
    );
  } catch {}
}

// ─── GET /api/ai/usage ───────────────────────────────────────────────────────
exports.getUsage = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    // Check premium
    const userRes = await pool.query(
      "SELECT is_premium, premium_expires_at FROM users WHERE id=$1", [userId]
    );
    const { is_premium, premium_expires_at } = userRes.rows[0] || {};
    const isPremium = is_premium && (!premium_expires_at || new Date(premium_expires_at) > new Date());

    if (isPremium) {
      return res.json({ success:true, isPremium:true, usedToday:0, remaining:"Unlimited", limit:"Unlimited" });
    }

    const usageRes = await pool.query(
      "SELECT count FROM ai_usage WHERE user_id=$1 AND usage_date=$2", [userId, today]
    );
    const usedToday = usageRes.rows.length ? parseInt(usageRes.rows[0].count) : 0;

    res.json({
      success: true,
      isPremium: false,
      usedToday,
      remaining: Math.max(0, FREE_LIMIT - usedToday),
      limit: FREE_LIMIT,
    });
  } catch (err) {
    res.status(500).json({ success:false });
  }
};

// ─── POST /api/ai/explain ────────────────────────────────────────────────────
exports.explainWord = async (req, res) => {
  try {
    const { word, definition, level="simple" } = req.body;
    if (!word) return res.status(400).json({ message:"Word required" });

    const cacheKey = `explain_${level}`;

    // Check cache first (cached = no limit consumed)
    const cached = await getCached(word, cacheKey);
    if (cached) {
      return res.json({
        success:true, word, level,
        explanation: cached,
        source: "cache",
        aiUsage: req.user.aiUsage,
      });
    }

    const explanation = await aiService.explainWord(word, definition||"", level);
    if (!explanation) {
      return res.status(503).json({ message:"AI feature unavailable. Check API key configuration." });
    }

    await saveCache(word, cacheKey, explanation);
    

// ── Word ko DB mein save karo ──
try {
  const wCheck = await pool.query("SELECT id FROM words WHERE LOWER(word)=LOWER($1)", [word]);
  if (!wCheck.rows.length) {
    const wi = await pool.query(
      `INSERT INTO words(word) VALUES($1) ON CONFLICT(word) DO NOTHING RETURNING id`, [word]
    );
    const wordId = wi.rows[0]?.id;
    if (wordId && definition) {
      await pool.query(
        `INSERT INTO meanings(word_id, definition, part_of_speech) VALUES($1,$2,'general') ON CONFLICT DO NOTHING`,
        [wordId, definition]
      );
    }
  }
} catch {}
// ── End save ──

res.json({ success:true, word, level, explanation, source:"ai", aiUsage: req.user.aiUsage });
    res.json({ success:true, word, level, explanation, source:"ai", aiUsage: req.user.aiUsage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:"AI explanation failed" });
  }
};

// ─── POST /api/ai/quiz ───────────────────────────────────────────────────────
exports.generateAIQuiz = async (req, res) => {
  try {
    const { word, definition } = req.body;
    if (!word || !definition) return res.status(400).json({ message:"Word and definition required" });

    const cached = await getCached(word, "quiz");
    if (cached) {
      try { return res.json({ success:true, quiz:JSON.parse(cached), source:"cache", aiUsage:req.user.aiUsage }); }
      catch {}
    }

    const quiz = await aiService.generateAIQuiz(word, definition);
    if (!quiz) return res.status(503).json({ message:"AI quiz generation failed. Check API key." });

    await saveCache(word, "quiz", JSON.stringify(quiz));
    res.json({ success:true, quiz, source:"ai", aiUsage:req.user.aiUsage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false });
  }
};

// ─── POST /api/ai/word-dna ───────────────────────────────────────────────────
exports.getWordDNA = async (req, res) => {
  try {
    const { word, definition } = req.body;
    if (!word) return res.status(400).json({ message:"Word required" });

    const cached = await getCached(word, "dna");
    if (cached) {
      try { return res.json({ success:true, word, dna:JSON.parse(cached), source:"cache", aiUsage:req.user.aiUsage }); }
      catch {}
    }

    const dna = await aiService.getWordDNA(word, definition||"");
    if (!dna) return res.status(503).json({ message:"AI feature unavailable. Check API key." });

    await saveCache(word, "dna", JSON.stringify(dna));
    res.json({ success:true, word, dna, source:"ai", aiUsage:req.user.aiUsage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false });
  }
};

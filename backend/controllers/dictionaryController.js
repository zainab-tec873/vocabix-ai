const pool = require("../config/db");
const axios = require("axios");

/* ─── Get word from DB ─────────────────────────────────────────────────────── */
async function getWordFromDB(word) {
  const wr = await pool.query("SELECT id,word FROM words WHERE LOWER(word)=LOWER($1)", [word]);
  if (!wr.rows.length) return null;
  const { id: wordId, word: wordText } = wr.rows[0];
  const [meanings, synonyms, antonyms, examples] = await Promise.all([
    pool.query("SELECT id,definition,part_of_speech FROM meanings WHERE word_id=$1", [wordId]),
    pool.query("SELECT synonym_word FROM synonyms_table WHERE word_id=$1", [wordId]),
    pool.query("SELECT antonym_word FROM antonyms_table WHERE word_id=$1", [wordId]),
    pool.query(`SELECT e.example_sentence,e.meaning_id FROM examples e JOIN meanings m ON e.meaning_id=m.id WHERE m.word_id=$1`, [wordId]),
  ]);
  const meaningData = meanings.rows.map(m => ({
    id: m.id, definition: m.definition,
    part_of_speech: m.part_of_speech || "general",
    examples: examples.rows.filter(e => e.meaning_id === m.id).map(e => e.example_sentence),
  }));
  return {
    word: wordText, word_id: wordId, meanings: meaningData,
    synonyms: synonyms.rows.map(s => s.synonym_word).filter(Boolean),
    antonyms: antonyms.rows.map(a => a.antonym_word).filter(Boolean),
  };
}

/* ─── Fetch from multiple APIs ─────────────────────────────────────────────── */
async function fetchFromAPIs(word) {
  // API 1: dictionaryapi.dev (primary)
  try {
    const r = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, { timeout: 7000 });
    if (r.data && r.data.length > 0) return { source: "dictionaryapi", data: r.data };
  } catch {}

  // API 2: Merriam-Webster free (no key needed for basic)
  try {
    const r = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`, { timeout: 7000 });
    if (r.data && r.data.length > 0) return { source: "dictionaryapi", data: r.data };
  } catch {}

  return null;
}

/* ─── Save API data to DB ──────────────────────────────────────────────────── */
async function saveWordToDB(word, apiData) {
  try {
    const wi = await pool.query(`INSERT INTO words(word) VALUES($1) ON CONFLICT(word) DO NOTHING RETURNING id`, [word]);
    let wordId = wi.rows.length ? wi.rows[0].id : (await pool.query("SELECT id FROM words WHERE word=$1", [word])).rows[0].id;

    for (const entry of apiData) {
      for (const meaning of (entry.meanings || [])) {
        const pos = meaning.partOfSpeech || "general";
        for (const def of (meaning.definitions || [])) {
          if (!def.definition) continue;
          const mi = await pool.query(
            `INSERT INTO meanings(word_id,definition,part_of_speech) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id`,
            [wordId, def.definition, pos]
          );
          if (mi.rows.length && def.example) {
            await pool.query(`INSERT INTO examples(meaning_id,example_sentence) VALUES($1,$2) ON CONFLICT DO NOTHING`, [mi.rows[0].id, def.example]);
          }
          for (const syn of (def.synonyms || [])) {
            if (syn) await pool.query(`INSERT INTO synonyms_table(word_id,synonym_word) VALUES($1,$2) ON CONFLICT DO NOTHING`, [wordId, syn]);
          }
          for (const ant of (def.antonyms || [])) {
            if (ant) await pool.query(`INSERT INTO antonyms_table(word_id,antonym_word) VALUES($1,$2) ON CONFLICT DO NOTHING`, [wordId, ant]);
          }
        }
        for (const syn of (meaning.synonyms || [])) {
          if (syn) await pool.query(`INSERT INTO synonyms_table(word_id,synonym_word) VALUES($1,$2) ON CONFLICT DO NOTHING`, [wordId, syn]);
        }
        for (const ant of (meaning.antonyms || [])) {
          if (ant) await pool.query(`INSERT INTO antonyms_table(word_id,antonym_word) VALUES($1,$2) ON CONFLICT DO NOTHING`, [wordId, ant]);
        }
      }
    }
    return wordId;
  } catch (e) {
    console.error("saveWordToDB error:", e.message);
    return null;
  }
}

/* ─── GET /api/dictionary/:word ─────────────────────────────────────────────── */
exports.getWord = async (req, res) => {
  try {
    const word = req.params.word.toLowerCase().trim();
    if (!word || word.length < 1) return res.status(400).json({ message: "Word is required" });

    // 1. Check DB first
    let dbData = await getWordFromDB(word);
    if (dbData && dbData.meanings.length > 0) {
      if (req.user) {
        await pool.query(`INSERT INTO search_history(user_id,word_id,searched_at) VALUES($1,$2,NOW())`, [req.user.id, dbData.word_id]).catch(() => {});
        await addXP(req.user.id, 5);
      }
      await pool.query("UPDATE words SET search_count=search_count+1 WHERE id=$1", [dbData.word_id]).catch(() => {});
      return res.json({ source: "database", data: dbData });
    }

    // 2. Try multiple external APIs
    const apiResult = await fetchFromAPIs(word);
    if (!apiResult) {
      const suggestions = await getSuggestions(word);
      return res.status(404).json({
        success: false,
        message: `Word "${word}" not found. Please check spelling.`,
        suggestions,
      });
    }

    // 3. Save to DB
    await saveWordToDB(word, apiResult.data);

    // 4. Return fresh from DB
    const freshData = await getWordFromDB(word);
    if (req.user && freshData) {
      await pool.query(`INSERT INTO search_history(user_id,word_id,searched_at) VALUES($1,$2,NOW())`, [req.user.id, freshData.word_id]).catch(() => {});
      await addXP(req.user.id, 5);
    }
    if (freshData) await pool.query("UPDATE words SET search_count=search_count+1 WHERE id=$1", [freshData.word_id]).catch(() => {});

    return res.json({ source: "api", data: freshData || { word, meanings: [], synonyms: [], antonyms: [] } });
  } catch (err) {
    console.error("getWord error:", err.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

/* ─── GET /api/dictionary/search/suggestions ───────────────────────────────── */
exports.searchSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) return res.json([]);
  try {
    const result = await pool.query(
      `SELECT word FROM words WHERE LOWER(word) LIKE LOWER($1) ORDER BY search_count DESC, word ASC LIMIT 10`,
      [q.trim() + "%"]
    );
    // Also partial match anywhere
    const partial = await pool.query(
      `SELECT word FROM words WHERE LOWER(word) LIKE LOWER($1) AND LOWER(word) NOT LIKE LOWER($2) ORDER BY search_count DESC LIMIT 5`,
      ["%" + q.trim() + "%", q.trim() + "%"]
    );
    const all = [...new Set([...result.rows.map(r => r.word), ...partial.rows.map(r => r.word)])];
    res.json(all.slice(0, 12));
  } catch { res.json([]); }
};

async function getSuggestions(word) {
  try {
    const prefix = await pool.query(
      `SELECT word FROM words WHERE LOWER(word) LIKE LOWER($1) ORDER BY search_count DESC LIMIT 5`,
      [word.substring(0, Math.min(3, word.length)) + "%"]
    );
    return prefix.rows.map(r => r.word);
  } catch { return []; }
}

/* ─── GET /api/dictionary/urdu/:word ───────────────────────────────────────── */
exports.getUrduMeaning = async (req, res) => {
  try {
    const word = req.params.word.toLowerCase().trim();
    // Use MyMemory free translation API (no key needed)
    const r = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|ur`,
      { timeout: 6000 }
    );
    const translation = r.data?.responseData?.translatedText;
    if (!translation || translation === word) {
      return res.json({ success: false, urdu: null, message: "Urdu translation not available" });
    }
    res.json({ success: true, word, urdu: translation });
  } catch {
    res.json({ success: false, urdu: null, message: "Translation service unavailable" });
  }
};

/* ─── GET /api/dictionary/word-of-the-day ──────────────────────────────────── */
exports.wordOfTheDay = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const r = await pool.query(
      `SELECT w.id,w.word,m.definition,m.part_of_speech FROM words w
       JOIN meanings m ON m.word_id=w.id
       WHERE m.definition IS NOT NULL AND LENGTH(m.definition) > 20
       ORDER BY MD5(w.word||$1) LIMIT 1`,
      [today]
    );
    res.json({ success: true, data: r.rows[0] || null });
  } catch { res.status(500).json({ success: false }); }
};

/* ─── GET /api/dictionary/trending ─────────────────────────────────────────── */
exports.getTrendingWords = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT DISTINCT ON(w.id) w.id,w.word,m.definition FROM words w
       JOIN meanings m ON m.word_id=w.id
       WHERE m.definition IS NOT NULL
       ORDER BY w.id, w.search_count DESC
       LIMIT 10`
    );
    res.json({ success: true, data: r.rows });
  } catch { res.status(500).json({ success: false }); }
};

/* ─── GET /api/dictionary/quiz ─────────────────────────────────────────────── */
exports.generateQuiz = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const quizWords = await pool.query(
      `SELECT DISTINCT ON(w.id) w.id,w.word,m.definition FROM words w
       JOIN meanings m ON m.word_id=w.id
       WHERE m.definition IS NOT NULL AND LENGTH(m.definition)>15
       ORDER BY w.id, RANDOM() LIMIT $1`,
      [limit]
    );
    if (quizWords.rows.length < 4) return res.status(400).json({ success: false, message: "Not enough words in database. Search some words first!" });
    const allDefs = await pool.query(`SELECT definition FROM meanings WHERE definition IS NOT NULL AND LENGTH(definition)>15 LIMIT 150`);
    const quiz = quizWords.rows.map(qw => {
      const wrong = allDefs.rows.filter(d => d.definition !== qw.definition).sort(() => Math.random()-0.5).slice(0,3).map(d => d.definition);
      const options = [...wrong, qw.definition].sort(() => Math.random()-0.5);
      return { word: qw.word, question: `What is the meaning of "${qw.word}"?`, options, correctAnswer: qw.definition };
    });
    res.json({ success: true, total: quiz.length, data: quiz });
  } catch (err) { console.error(err); res.status(500).json({ success: false }); }
};

/* ─── GET /api/dictionary/history ──────────────────────────────────────────── */
exports.getSearchHistory = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT DISTINCT ON(w.id) sh.searched_at,w.id,w.word,m.definition
       FROM search_history sh JOIN words w ON sh.word_id=w.id
       LEFT JOIN meanings m ON m.word_id=w.id
       WHERE sh.user_id=$1
       ORDER BY w.id, sh.searched_at DESC LIMIT 50`,
      [req.user.id]
    );
    const sorted = r.rows.sort((a,b) => new Date(b.searched_at)-new Date(a.searched_at));
    res.json({ success: true, data: sorted });
  } catch { res.status(500).json({ success: false }); }
};

/* ─── GET /api/dictionary/mood ─────────────────────────────────────────────── */
exports.getMoodWords = async (req, res) => {
  try {
    const { mood } = req.query;
    const moodMap = {
      happy:    ["euphoria","elation","jubilant","exuberant","radiant","vivacious","bliss","delight"],
      sad:      ["melancholy","sorrow","forlorn","wistful","somber","pensive","lament","desolate"],
      curious:  ["serendipity","epiphany","inquisitive","wanderlust","enigmatic","ponder","intrigue","marvel"],
      inspired: ["eloquent","luminous","resplendent","ethereal","transcendent","sublime","vivid","aspire"],
      calm:     ["serene","tranquil","placid","equanimity","solace","repose","mellow","languid"],
      powerful: ["indomitable","formidable","tenacious","resolute","audacious","valiant","mighty","dauntless"],
    };
    const words = moodMap[mood] || moodMap.curious;
    const placeholders = words.map((_,i) => `$${i+1}`).join(",");
    const r = await pool.query(
      `SELECT w.id,w.word,m.definition FROM words w
       JOIN meanings m ON m.word_id=w.id
       WHERE LOWER(w.word) IN (${placeholders}) AND m.definition IS NOT NULL LIMIT 8`,
      words
    );
    const found = r.rows.map(r => r.word.toLowerCase());
    const missing = words.filter(w => !found.includes(w)).map(w => ({ word:w, definition:null, id:null }));
    res.json({ success: true, mood, data: [...r.rows, ...missing].slice(0,8) });
  } catch { res.status(500).json({ success: false }); }
};

/* ─── POST /api/dictionary/quiz/xp ─────────────────────────────────────────── */
exports.addQuizXP = async (req, res) => {
  try {
    const { score, total } = req.body;
    const xp = Math.round((score / total) * 50);
    await addXP(req.user.id, xp);
    res.json({ success: true, xpEarned: xp });
  } catch { res.status(500).json({ success: false }); }
};

async function addXP(userId, amount) {
  try {
    await pool.query(`UPDATE user_stats SET xp=xp+$1 WHERE user_id=$2`, [amount, userId]);
    const r = await pool.query("SELECT xp,level FROM user_stats WHERE user_id=$1", [userId]);
    if (r.rows.length) {
      const newLevel = Math.floor(r.rows[0].xp / 100) + 1;
      if (newLevel !== r.rows[0].level) await pool.query("UPDATE user_stats SET level=$1 WHERE user_id=$2", [newLevel, userId]);
    }
  } catch {}
}

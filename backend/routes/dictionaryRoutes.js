const router = require("express").Router();
const d = require("../controllers/dictionaryController");
const mid = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

const optAuth = (req, res, next) => {
  const h = req.headers.authorization;
  if (h && h.startsWith("Bearer ")) {
    try { req.user = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET); } catch {}
  }
  next();
};

router.get("/word-of-the-day",      d.wordOfTheDay);
router.get("/trending",             d.getTrendingWords);
router.get("/quiz",                 d.generateQuiz);
router.get("/search/suggestions",   d.searchSuggestions);
router.get("/history",              mid, d.getSearchHistory);
router.get("/mood",                 d.getMoodWords);
router.post("/quiz/xp",             mid, d.addQuizXP);
router.get("/urdu/:word",           d.getUrduMeaning);
router.get("/:word",                optAuth, d.getWord);

module.exports = router;

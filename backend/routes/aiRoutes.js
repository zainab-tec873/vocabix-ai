const router = require("express").Router();
const ai = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");
const aiLimitMiddleware = require("../middleware/aiLimitMiddleware");

// Auth required + AI limit check (5/day free, unlimited premium)
router.post("/explain",  authMiddleware, aiLimitMiddleware, ai.explainWord);
router.post("/quiz",     authMiddleware, aiLimitMiddleware, ai.generateAIQuiz);
router.post("/word-dna", authMiddleware, aiLimitMiddleware, ai.getWordDNA);

// Get today's usage stats (no limit middleware)
router.get("/usage",     authMiddleware, ai.getUsage);

module.exports = router;

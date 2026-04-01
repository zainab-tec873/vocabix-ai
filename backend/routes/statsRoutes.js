const router = require("express").Router();
const mid = require("../middleware/authMiddleware");
router.get("/", mid, require("../controllers/statsController").getUserStats);
module.exports = router;

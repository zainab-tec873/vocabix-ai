const router = require("express").Router();
const auth = require("../controllers/authController");
const mid = require("../middleware/authMiddleware");
router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/me", mid, auth.getMe);
module.exports = router;

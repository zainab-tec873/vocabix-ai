const router = require("express").Router();
const premium = require("../controllers/premiumController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// User routes
router.get("/status", authMiddleware, premium.getStatus);

// Admin only routes
router.post("/activate", authMiddleware, adminMiddleware, premium.activate);
router.get("/users",    authMiddleware, adminMiddleware, premium.getPremiumUsers);
router.get("/payments", authMiddleware, adminMiddleware, premium.getAllPayments);

module.exports = router;

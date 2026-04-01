const router = require("express").Router();
const f = require("../controllers/favoriteController");
const mid = require("../middleware/authMiddleware");
router.use(mid);
router.get("/", f.getFavorites);
router.post("/", f.addFavorite);
router.delete("/:word_id", f.removeFavorite);
router.get("/check/:word_id", f.checkFavorite);
module.exports = router;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use("/api/", rateLimit({ windowMs: 15*60*1000, max: 300, message: "Too many requests" }));

app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/dictionary", require("./routes/dictionaryRoutes"));
app.use("/api/favorites",  require("./routes/favoriteRoutes"));
app.use("/api/ai",         require("./routes/aiRoutes"));
app.use("/api/stats",      require("./routes/statsRoutes"));
app.use("/api/premium",    require("./routes/premiumRoutes"));

app.get("/health", (_, res) => res.json({ status: "OK", time: new Date() }));
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use(require("./middleware/errorHandler"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Vocabix AI server on http://localhost:${PORT}`));

# ✦ Lexify v2 — AI-Powered Dictionary

## 🚀 Quick Start

### 1. Database
```bash
psql -U postgres -d aidictionary -f database_setup.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your DB password and ANTHROPIC_API_KEY
npm start        # runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev      # runs on http://localhost:3000
```

## ⚙️ .env Setup (backend/.env)
```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/aidictionary
JWT_SECRET=any_random_secret_here
ANTHROPIC_API_KEY=sk-ant-...   # from console.anthropic.com
```

## ✨ Features
| Feature | Description |
|---|---|
| 🔐 Auth | JWT login/register with bcrypt |
| ◈ Dictionary | Smart search, autocomplete, API fallback |
| 🔊 TTS | Click any word to hear pronunciation |
| 🧬 Word DNA | Etymology, difficulty, emotion, fun facts (AI) |
| 📖 Meanings | Grouped by part of speech with examples |
| 🎭 Mood Discovery | Find words matching your emotional state |
| ◎ Quiz | Multiple choice with XP rewards |
| ♡ Favorites | Save & filter your word collection |
| ◷ History | Search history + GitHub-style heatmap |
| ✦ AI Coach | 3-level explanations (Kid / Beginner / Expert) |
| ⚡ XP & Levels | Earn XP, level up Beginner → Lexicon Master |
| 🔥 Streaks | Daily login streak tracking |
| ☀/🌙 Theme | Dark/Light mode toggle |
| 📱 Responsive | Works on mobile & desktop |

## 📁 Structure
```
lexify_v2/
├── backend/
│   ├── controllers/   (auth, dictionary, favorites, ai, stats)
│   ├── routes/        (all API routes)
│   ├── services/      (Claude AI integration)
│   ├── middleware/    (JWT auth, error handler)
│   ├── config/db.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/dashboard/
│       │   ├── HomePage      (stats, XP, WOTD, trending)
│       │   ├── DictionaryPage (search, DNA, TTS, synonyms)
│       │   ├── QuizPage      (MCQ with XP)
│       │   ├── FavoritesPage (saved words + filter)
│       │   ├── HistoryPage   (history + heatmap)
│       │   ├── MoodPage      (🎭 unique mood discovery)
│       │   └── CoachPage     (3-level AI explain + quiz)
│       ├── context/  (Auth + Theme)
│       └── styles/   (dark/light CSS vars)
└── database_setup.sql
```

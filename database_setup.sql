-- ============================================
-- Lexify v2 — Full Database Setup
-- Run: psql -U postgres -d aidictionary -f database_setup.sql
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stats (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak INT DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(255) UNIQUE NOT NULL,
  search_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meanings (
  id SERIAL PRIMARY KEY,
  word_id INT REFERENCES words(id) ON DELETE CASCADE,
  definition TEXT NOT NULL,
  part_of_speech VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(word_id, definition)
);

CREATE TABLE IF NOT EXISTS examples (
  id SERIAL PRIMARY KEY,
  meaning_id INT REFERENCES meanings(id) ON DELETE CASCADE,
  example_sentence TEXT NOT NULL,
  UNIQUE(meaning_id, example_sentence)
);

CREATE TABLE IF NOT EXISTS synonyms_table (
  id SERIAL PRIMARY KEY,
  word_id INT REFERENCES words(id) ON DELETE CASCADE,
  synonym_word VARCHAR(255),
  UNIQUE(word_id, synonym_word)
);

CREATE TABLE IF NOT EXISTS antonyms_table (
  id SERIAL PRIMARY KEY,
  word_id INT REFERENCES words(id) ON DELETE CASCADE,
  antonym_word VARCHAR(255),
  UNIQUE(word_id, antonym_word)
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  word_id INT REFERENCES words(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

CREATE TABLE IF NOT EXISTS search_history (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  word_id INT REFERENCES words(id) ON DELETE CASCADE,
  searched_at TIMESTAMP DEFAULT NOW()
);

-- ✅ NEW: AI Cache Table — saves API cost!
CREATE TABLE IF NOT EXISTS ai_cache (
  id SERIAL PRIMARY KEY,
  word VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,        -- 'explain_kid', 'explain_simple', 'explain_expert', 'quiz', 'dna'
  content TEXT NOT NULL,            -- AI response saved here
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(word, type)
);

-- ✅ NEW: Premium payments table
CREATE TABLE IF NOT EXISTS premium_payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PKR',
  payment_method VARCHAR(50),       -- 'jazzcash', 'easypaisa', 'stripe'
  transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  plan VARCHAR(20) DEFAULT 'monthly',   -- 'monthly', 'yearly'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_words_lower ON words(LOWER(word));
CREATE INDEX IF NOT EXISTS idx_meanings_word ON meanings(word_id);
CREATE INDEX IF NOT EXISTS idx_synonyms_word ON synonyms_table(word_id);
CREATE INDEX IF NOT EXISTS idx_antonyms_word ON antonyms_table(word_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON search_history(searched_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_word ON ai_cache(word, type);
CREATE INDEX IF NOT EXISTS idx_users_premium ON users(is_premium);

SELECT '✅ Lexify v2 Database setup complete!' AS status;

-- ✅ AI Usage Tracking (Free Trial — 5/day)
CREATE TABLE IF NOT EXISTS ai_usage (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE DEFAULT CURRENT_DATE,
  count INT DEFAULT 0,
  UNIQUE(user_id, usage_date)
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, usage_date);

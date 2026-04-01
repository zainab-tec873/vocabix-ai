-- ============================================
-- Lexify v2 — Database UPDATE Script
-- Agar pehle se DB hai to SIRF YEH RUN KARO
-- ============================================

-- Users table mein premium columns add karo
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP;

-- AI Cache table (naya)
CREATE TABLE IF NOT EXISTS ai_cache (
  id SERIAL PRIMARY KEY,
  word VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(word, type)
);

-- Premium payments table (naya)
CREATE TABLE IF NOT EXISTS premium_payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PKR',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  plan VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT NOW()
);

-- user_stats table (agar nahi hai)
CREATE TABLE IF NOT EXISTS user_stats (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak INT DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id)
);

-- New indexes
CREATE INDEX IF NOT EXISTS idx_ai_cache_word ON ai_cache(word, type);
CREATE INDEX IF NOT EXISTS idx_users_premium ON users(is_premium);

SELECT '✅ Database update complete!' AS status;

-- AI Usage table (free trial tracking)
CREATE TABLE IF NOT EXISTS ai_usage (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE DEFAULT CURRENT_DATE,
  count INT DEFAULT 0,
  UNIQUE(user_id, usage_date)
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, usage_date);
SELECT '✅ AI usage table added!' AS status;

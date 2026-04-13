-- Favor International Report Builder - D1 Schema

-- Auth
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Shared dimension
CREATE TABLE IF NOT EXISTS reporting_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL,
  month INTEGER,
  label TEXT NOT NULL,
  UNIQUE(year, quarter, month)
);

-- Social Media
CREATE TABLE IF NOT EXISTS social_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  UNIQUE(platform, account_name)
);

CREATE TABLE IF NOT EXISTS social_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  period_id INTEGER NOT NULL,
  total_views INTEGER,
  three_sec_views INTEGER,
  one_min_views INTEGER,
  accounts_reached INTEGER,
  views_change_pct REAL,
  views_by_content_type TEXT,
  follower_views_pct REAL,
  non_follower_views_pct REAL,
  total_interactions INTEGER,
  interactions_from_followers_pct REAL,
  interactions_from_non_followers_pct REAL,
  likes INTEGER,
  comments INTEGER,
  saves INTEGER,
  shares INTEGER,
  reposts INTEGER,
  total_profile_activity INTEGER,
  profile_visits INTEGER,
  external_link_taps INTEGER,
  profile_activity_change_pct REAL,
  total_followers INTEGER,
  net_follower_growth INTEGER,
  new_follows INTEGER,
  unfollows INTEGER,
  followers_change_pct REAL,
  gender_male_pct REAL,
  gender_female_pct REAL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(account_id, period_id),
  FOREIGN KEY (account_id) REFERENCES social_accounts(id),
  FOREIGN KEY (period_id) REFERENCES reporting_periods(id)
);

CREATE TABLE IF NOT EXISTS social_top_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  period_id INTEGER NOT NULL,
  ranking_type TEXT NOT NULL,
  rank_position INTEGER NOT NULL,
  content_title TEXT,
  content_type TEXT,
  metric_value INTEGER,
  content_date TEXT,
  FOREIGN KEY (account_id) REFERENCES social_accounts(id),
  FOREIGN KEY (period_id) REFERENCES reporting_periods(id)
);

CREATE TABLE IF NOT EXISTS social_demographics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  period_id INTEGER NOT NULL,
  demo_type TEXT NOT NULL,
  demo_value TEXT NOT NULL,
  percentage REAL,
  male_pct REAL,
  female_pct REAL,
  FOREIGN KEY (account_id) REFERENCES social_accounts(id),
  FOREIGN KEY (period_id) REFERENCES reporting_periods(id)
);

-- Direct Mail Appeals
CREATE TABLE IF NOT EXISTS direct_mail_appeals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_id INTEGER NOT NULL,
  appeal_id TEXT NOT NULL,
  description TEXT,
  topic_audience TEXT,
  num_solicitors INTEGER,
  gifts INTEGER,
  donors INTEGER,
  response_pct REAL,
  total_given REAL,
  avg_per_gift REAL,
  avg_per_donor REAL,
  goal REAL,
  over_under REAL,
  total_cost REAL,
  cost_per_gift REAL,
  cost_per_donor REAL,
  brm_returns_cost REAL,
  profit_loss REAL,
  package_cost REAL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(period_id, appeal_id),
  FOREIGN KEY (period_id) REFERENCES reporting_periods(id)
);

-- Email Newsletters
CREATE TABLE IF NOT EXISTS email_newsletters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  status TEXT,
  subject_line TEXT,
  audience_list TEXT,
  date_sent TEXT,
  is_resend INTEGER DEFAULT 0,
  original_newsletter_id INTEGER,
  recipients INTEGER,
  opens INTEGER,
  clicks INTEGER,
  transactions INTEGER,
  total_raised REAL,
  bounces INTEGER,
  unsubscribes INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (period_id) REFERENCES reporting_periods(id),
  FOREIGN KEY (original_newsletter_id) REFERENCES email_newsletters(id)
);

-- Thank You Receipts
CREATE TABLE IF NOT EXISTS thank_you_receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_id INTEGER NOT NULL,
  appeal_id TEXT NOT NULL,
  description TEXT,
  num_solicitors INTEGER,
  gifts INTEGER,
  donors INTEGER,
  response_pct REAL,
  total_given REAL,
  avg_per_gift REAL,
  avg_per_donor REAL,
  goal REAL,
  over_under REAL,
  total_cost REAL,
  cost_per_gift REAL,
  cost_per_donor REAL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(period_id, appeal_id),
  FOREIGN KEY (period_id) REFERENCES reporting_periods(id)
);

-- Upload audit log
CREATE TABLE IF NOT EXISTS upload_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uploaded_by TEXT NOT NULL,
  data_category TEXT NOT NULL,
  period_label TEXT,
  rows_imported INTEGER,
  status TEXT DEFAULT 'success',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_metrics_account ON social_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_social_metrics_period ON social_metrics(period_id);
CREATE INDEX IF NOT EXISTS idx_social_top_content_ap ON social_top_content(account_id, period_id);
CREATE INDEX IF NOT EXISTS idx_social_demographics_ap ON social_demographics(account_id, period_id);
CREATE INDEX IF NOT EXISTS idx_direct_mail_period ON direct_mail_appeals(period_id);
CREATE INDEX IF NOT EXISTS idx_email_newsletters_period ON email_newsletters(period_id);
CREATE INDEX IF NOT EXISTS idx_thank_you_period ON thank_you_receipts(period_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Seed social accounts
INSERT OR IGNORE INTO social_accounts (platform, account_name, account_type) VALUES
  ('facebook', 'Favor International', 'organization'),
  ('facebook', 'Carole Ward', 'personal'),
  ('instagram', 'Favor International', 'organization'),
  ('instagram', 'Carole Ward', 'personal'),
  ('tiktok', 'Favor International', 'organization'),
  ('tiktok', 'Carole Ward', 'personal');

-- Seed settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('org_name', 'Favor International'),
  ('brm_cost_per_piece', '1.77');

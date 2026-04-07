CREATE TABLE stay_log (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  entry_date DATE NOT NULL,
  exit_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE stay_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON stay_log FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE costs (
  id TEXT PRIMARY KEY,
  firm TEXT NOT NULL,
  label TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('monthly', 'yearly', 'once')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON costs FOR ALL USING (true) WITH CHECK (true);

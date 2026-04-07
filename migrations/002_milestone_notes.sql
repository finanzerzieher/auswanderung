CREATE TABLE milestone_notes (
  id TEXT PRIMARY KEY,
  milestone_title TEXT NOT NULL,
  note TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE milestone_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON milestone_notes FOR ALL USING (true) WITH CHECK (true);

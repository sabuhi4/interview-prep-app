CREATE TABLE IF NOT EXISTS user_question_progress (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  bookmarked BOOLEAN NOT NULL DEFAULT false,
  done BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

CREATE TABLE IF NOT EXISTS user_quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_question_progress_user ON user_question_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user ON user_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_completed ON user_quiz_results(user_id, completed_at DESC);

ALTER TABLE user_question_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own question progress"
  ON user_question_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own quiz results"
  ON user_quiz_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

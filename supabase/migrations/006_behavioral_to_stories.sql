ALTER TABLE stories ADD COLUMN IF NOT EXISTS prompt TEXT;

DELETE FROM questions WHERE category = 'Behavioral';

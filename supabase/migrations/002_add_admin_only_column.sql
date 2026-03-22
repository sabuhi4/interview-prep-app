ALTER TABLE questions ADD COLUMN admin_only BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX idx_questions_admin_only ON questions(admin_only);

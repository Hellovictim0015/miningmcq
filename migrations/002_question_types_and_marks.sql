-- Adds MCQ / MSQ / NAT question types and per-question marking.
-- Additive only: existing questions become MCQ worth 1 mark with no negative marking.
--
-- How answers.correct_answer is stored per type:
--   MCQ -> the exact text of the correct option (unchanged from before)
--   MSQ -> JSON array of the correct options' texts, e.g. ["Option A","Option C"]
--   NAT -> the numeric answer as text, e.g. "12.5" (answers.answer_tolerance = allowed +/- range)

ALTER TABLE questions ADD COLUMN question_type ENUM('MCQ','MSQ','NAT') NOT NULL DEFAULT 'MCQ';
ALTER TABLE questions ADD COLUMN marks DECIMAL(6,2) NOT NULL DEFAULT 1;
ALTER TABLE questions ADD COLUMN negative_marks DECIMAL(6,2) NOT NULL DEFAULT 0;
ALTER TABLE answers ADD COLUMN answer_tolerance DECIMAL(10,4) NOT NULL DEFAULT 0;

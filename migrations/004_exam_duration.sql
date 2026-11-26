-- Run this against the `mcq` database BEFORE deploying the exam-duration feature.
-- Additive only: one new column on courses. Existing courses get 60 minutes,
-- which matches the timer that was previously hard-coded in the exam page.

ALTER TABLE courses ADD COLUMN exam_duration_minutes INT NOT NULL DEFAULT 60;

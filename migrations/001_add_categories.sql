-- Run this against the `mcq` database before using the new Categories feature.
-- Additive only: creates one new table and adds one nullable column to three
-- existing tables. Safe to run on a live database, does not touch existing data.

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE courses ADD COLUMN category_id INT NULL;
ALTER TABLE videocourses ADD COLUMN category_id INT NULL;
ALTER TABLE study_materials ADD COLUMN category_id INT NULL;

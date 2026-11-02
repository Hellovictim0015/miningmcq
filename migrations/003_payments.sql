-- Documents the `payments` table the payment APIs rely on (it was created by
-- hand and had no migration), and makes payment_id unique so the browser
-- verify call and the Razorpay webhook can never save the same payment twice.
--
-- CREATE TABLE IF NOT EXISTS does nothing on a database that already has it.

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  product_type ENUM('mcq_course','video_course','study_material') NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  payment_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_lookup (user_id, course_id, product_type, payment_status)
);

-- Before adding the unique index, check for existing duplicates. If this
-- returns rows, delete the extra copies (keep one row per payment_id) first,
-- or the ALTER below will fail.
--   SELECT payment_id, COUNT(*) FROM payments GROUP BY payment_id HAVING COUNT(*) > 1;

ALTER TABLE payments ADD UNIQUE INDEX uq_payments_payment_id (payment_id);

-- Add snils column to health_applications
ALTER TABLE health_applications
    ADD COLUMN IF NOT EXISTS snils VARCHAR(20); 
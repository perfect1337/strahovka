-- Add passport_number column to health_applications
ALTER TABLE health_applications
    ADD COLUMN IF NOT EXISTS passport_number VARCHAR(20); 
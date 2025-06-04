-- Add has_disabilities column to health_applications
ALTER TABLE health_applications
    ADD COLUMN IF NOT EXISTS has_disabilities BOOLEAN DEFAULT FALSE; 
-- Add has_chronic_diseases column to health_applications
ALTER TABLE health_applications
    ADD COLUMN IF NOT EXISTS has_chronic_diseases BOOLEAN DEFAULT FALSE; 
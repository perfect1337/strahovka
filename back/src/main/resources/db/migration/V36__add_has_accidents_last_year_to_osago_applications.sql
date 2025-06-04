-- Add has_accidents_last_year column to osago_applications
ALTER TABLE osago_applications
    ADD COLUMN IF NOT EXISTS has_accidents_last_year BOOLEAN; 
-- Add has_chronic_diseases column to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS has_chronic_diseases BOOLEAN; 
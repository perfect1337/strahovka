-- Add has_fire_alarm column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS has_fire_alarm BOOLEAN; 
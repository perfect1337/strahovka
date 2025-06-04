-- Add has_mortage column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS has_mortage BOOLEAN; 
-- Add cover_theft column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS cover_theft BOOLEAN; 
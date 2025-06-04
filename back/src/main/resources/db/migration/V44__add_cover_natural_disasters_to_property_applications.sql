-- Add cover_natural_disasters column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS cover_natural_disasters BOOLEAN; 
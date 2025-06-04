-- Add property_area column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS property_area DOUBLE PRECISION; 
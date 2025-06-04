-- Add construction_type column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS construction_type VARCHAR(50); 
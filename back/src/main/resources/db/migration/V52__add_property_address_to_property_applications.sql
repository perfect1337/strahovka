-- Add property_address column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS property_address VARCHAR(255); 
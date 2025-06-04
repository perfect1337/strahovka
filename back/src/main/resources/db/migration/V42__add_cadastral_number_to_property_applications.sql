-- Add cadastral_number column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS cadastral_number VARCHAR(255); 
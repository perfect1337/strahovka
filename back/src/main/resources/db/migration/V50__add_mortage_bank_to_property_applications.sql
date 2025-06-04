-- Add mortage_bank column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS mortage_bank VARCHAR(255); 
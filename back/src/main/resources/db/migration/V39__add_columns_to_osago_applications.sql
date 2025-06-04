-- Add columns to osago_applications
ALTER TABLE osago_applications
    ADD COLUMN IF NOT EXISTS registration_certificate VARCHAR(255),
    ADD COLUMN IF NOT EXISTS region_registration VARCHAR(255); 
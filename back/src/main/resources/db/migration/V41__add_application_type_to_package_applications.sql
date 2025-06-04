-- Add application_type column to package_applications
ALTER TABLE package_applications
    ADD COLUMN IF NOT EXISTS application_type VARCHAR(50); 
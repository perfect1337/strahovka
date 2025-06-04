-- Add preferred_clinic column to health_applications
ALTER TABLE health_applications
    ADD COLUMN IF NOT EXISTS preferred_clinic VARCHAR(255); 
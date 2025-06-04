-- Add duration_months column to osago_applications
ALTER TABLE osago_applications
    ADD COLUMN IF NOT EXISTS duration_months INTEGER; 
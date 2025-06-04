-- Add is_unlimited_drivers column to osago_applications
ALTER TABLE osago_applications
    ADD COLUMN IF NOT EXISTS is_unlimited_drivers BOOLEAN; 
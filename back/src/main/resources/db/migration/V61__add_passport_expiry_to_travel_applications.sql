-- Add passport_expiry column to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS passport_expiry DATE; 
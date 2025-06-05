-- Add cover_accidents column to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS cover_accidents BOOLEAN; 
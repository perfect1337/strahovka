-- Add cover_luggage column to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS cover_luggage BOOLEAN; 
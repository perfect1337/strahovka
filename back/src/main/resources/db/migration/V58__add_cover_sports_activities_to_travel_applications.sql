-- Add cover_sports_activities column to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS cover_sports_activities BOOLEAN; 
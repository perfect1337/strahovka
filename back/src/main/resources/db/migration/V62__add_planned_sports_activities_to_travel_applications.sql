-- Add planned_sports_activities column to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS planned_sports_activities VARCHAR(255); 
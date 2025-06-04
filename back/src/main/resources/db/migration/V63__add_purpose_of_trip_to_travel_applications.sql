-- Add purpose_of_trip column to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS purpose_of_trip VARCHAR(255); 
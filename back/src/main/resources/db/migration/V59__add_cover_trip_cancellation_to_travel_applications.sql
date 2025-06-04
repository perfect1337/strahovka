-- Add cover_trip_cancellation column to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS cover_trip_cancellation BOOLEAN; 
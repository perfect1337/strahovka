-- Add cover_medical_expenses column to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS cover_medical_expenses BOOLEAN; 
-- Add family_doctor_needed column to health_applications
ALTER TABLE health_applications
    ADD COLUMN IF NOT EXISTS family_doctor_needed BOOLEAN DEFAULT FALSE; 
-- Консолидированные изменения для travel_applications

ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS cover_accidents BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cover_luggage BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cover_medical_expenses BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cover_sports_activities BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cover_trip_cancellation BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_chronic_diseases BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS passport_expiry DATE,
    ADD COLUMN IF NOT EXISTS planned_sports_activities TEXT,
    ADD COLUMN IF NOT EXISTS purpose_of_trip VARCHAR(255); 
-- Консолидированные изменения для health_applications

ALTER TABLE health_applications
    ADD COLUMN IF NOT EXISTS family_doctor_needed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS chronic_diseases TEXT,
    ADD COLUMN IF NOT EXISTS disabilities TEXT,
    ADD COLUMN IF NOT EXISTS passport_number VARCHAR(255),
    ADD COLUMN IF NOT EXISTS preferred_clinic VARCHAR(255),
    ADD COLUMN IF NOT EXISTS smoking_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS snils VARCHAR(14); 
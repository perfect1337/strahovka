-- Консолидированные изменения для osago_applications

ALTER TABLE osago_applications
    ADD COLUMN IF NOT EXISTS duration_months INTEGER DEFAULT 12,
    ADD COLUMN IF NOT EXISTS engine_power INTEGER,
    ADD COLUMN IF NOT EXISTS has_accidents_last_year BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_unlimited_drivers BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS previous_policy_number VARCHAR(255),
    ADD COLUMN IF NOT EXISTS region_registration VARCHAR(100),
    ADD COLUMN IF NOT EXISTS registration_certificate VARCHAR(255); 
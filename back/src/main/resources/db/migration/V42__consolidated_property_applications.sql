-- Консолидированные изменения для property_applications

ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS cadastral_number VARCHAR(255),
    ADD COLUMN IF NOT EXISTS construction_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cover_natural_disasters BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cover_theft BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cover_third_party_liability BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_fire_alarm BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_mortage BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_security_system BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS mortage_bank VARCHAR(255),
    ADD COLUMN IF NOT EXISTS ownership_document_number VARCHAR(255),
    ADD COLUMN IF NOT EXISTS property_address TEXT,
    ADD COLUMN IF NOT EXISTS property_area DECIMAL(10,2); 
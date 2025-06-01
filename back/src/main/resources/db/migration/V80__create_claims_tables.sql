-- Drop existing tables in reverse order to avoid foreign key constraints
DROP TABLE IF EXISTS claim_comments;
DROP TABLE IF EXISTS claim_messages;
DROP TABLE IF EXISTS claim_attachments;
DROP TABLE IF EXISTS insurance_claims;

-- Drop application tables in reverse order
DROP TABLE IF EXISTS travel_applications;
DROP TABLE IF EXISTS health_applications;
DROP TABLE IF EXISTS property_applications;
DROP TABLE IF EXISTS osago_applications;
DROP TABLE IF EXISTS kasko_applications;
DROP TABLE IF EXISTS base_applications;

-- Create base application table
CREATE TABLE base_applications (
    id BIGSERIAL PRIMARY KEY,
    application_type VARCHAR(50) NOT NULL,
    user_id BIGINT REFERENCES users(id),
    policy_id BIGINT REFERENCES insurance_policies(id),
    application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    calculated_amount DECIMAL(10, 2),
    notes TEXT,
    status VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE
);

-- Create KASKO applications table with joined inheritance
CREATE TABLE kasko_applications (
    id BIGINT PRIMARY KEY REFERENCES base_applications(id),
    car_make VARCHAR(255) NOT NULL,
    car_model VARCHAR(255) NOT NULL,
    car_year INTEGER NOT NULL,
    vin_number VARCHAR(17) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    car_value DECIMAL(10, 2) NOT NULL,
    driver_license_number VARCHAR(20) NOT NULL,
    driver_experience_years INTEGER NOT NULL,
    has_anti_theft_system BOOLEAN DEFAULT false,
    garage_parking BOOLEAN DEFAULT false,
    previous_insurance_number VARCHAR(50),
    duration INTEGER NOT NULL
);

-- Create OSAGO applications table with joined inheritance
CREATE TABLE osago_applications (
    id BIGINT PRIMARY KEY REFERENCES base_applications(id),
    car_make VARCHAR(255) NOT NULL,
    car_model VARCHAR(255) NOT NULL,
    car_year INTEGER NOT NULL,
    vin_number VARCHAR(17) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    registration_certificate VARCHAR(50) NOT NULL,
    driver_license_number VARCHAR(20) NOT NULL,
    driver_experience_years INTEGER NOT NULL,
    engine_power INTEGER NOT NULL,
    region_registration VARCHAR(100) NOT NULL,
    has_accidents_last_year BOOLEAN,
    previous_policy_number VARCHAR(50)
);

-- Create property applications table with joined inheritance
CREATE TABLE property_applications (
    id BIGINT PRIMARY KEY REFERENCES base_applications(id),
    property_type VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    property_area DECIMAL(10, 2) NOT NULL,
    year_built INTEGER NOT NULL,
    construction_type VARCHAR(100) NOT NULL,
    property_value DECIMAL(10, 2) NOT NULL,
    has_security_system BOOLEAN,
    has_fire_alarm BOOLEAN,
    cover_natural_disasters BOOLEAN DEFAULT true,
    cover_theft BOOLEAN DEFAULT true,
    cover_third_party_liability BOOLEAN DEFAULT false,
    ownership_document_number VARCHAR(50) NOT NULL,
    cadastral_number VARCHAR(50) NOT NULL,
    has_mortage BOOLEAN,
    mortage_bank VARCHAR(100)
);

-- Create health applications table with joined inheritance
CREATE TABLE health_applications (
    id BIGINT PRIMARY KEY REFERENCES base_applications(id),
    birth_date DATE NOT NULL,
    passport_number VARCHAR(20) NOT NULL,
    snils VARCHAR(14) NOT NULL,
    has_chronic_diseases BOOLEAN,
    chronic_diseases_details TEXT,
    has_disabilities BOOLEAN,
    disabilities_details TEXT,
    smoking_status BOOLEAN,
    cover_dental BOOLEAN DEFAULT false,
    cover_vision BOOLEAN DEFAULT false,
    cover_maternity BOOLEAN DEFAULT false,
    cover_emergency BOOLEAN DEFAULT true,
    preferred_clinic VARCHAR(200),
    family_doctor_needed BOOLEAN
);

-- Create travel applications table with joined inheritance
CREATE TABLE travel_applications (
    id BIGINT PRIMARY KEY REFERENCES base_applications(id),
    passport_number VARCHAR(20) NOT NULL,
    passport_expiry DATE NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    travel_start_date DATE NOT NULL,
    travel_end_date DATE NOT NULL,
    purpose_of_trip VARCHAR(100) NOT NULL,
    cover_medical_expenses BOOLEAN DEFAULT true,
    cover_accidents BOOLEAN DEFAULT true,
    cover_luggage BOOLEAN DEFAULT false,
    cover_trip_cancellation BOOLEAN DEFAULT false,
    cover_sports_activities BOOLEAN DEFAULT false,
    has_chronic_diseases BOOLEAN,
    planned_sports_activities TEXT
);

-- Create insurance claims tables
CREATE TABLE insurance_claims (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT REFERENCES insurance_policies(id),
    user_id BIGINT REFERENCES users(id),
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    amount_requested DOUBLE PRECISION,
    amount_approved DOUBLE PRECISION,
    processed_by VARCHAR(255),
    processed_at TIMESTAMP
);

CREATE TABLE claim_attachments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    uploaded_at TIMESTAMP NOT NULL
);

CREATE TABLE claim_messages (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    sender_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE claim_comments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    user_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
); 
-- KASKO Applications
CREATE TABLE kasko_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    application_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    calculated_amount DECIMAL(10,2),
    notes TEXT,
    car_make VARCHAR(100) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_year INTEGER NOT NULL,
    vin_number VARCHAR(17) NOT NULL,
    license_plate VARCHAR(20),
    car_value DECIMAL(10,2),
    driver_license_number VARCHAR(20) NOT NULL,
    driver_experience_years INTEGER,
    has_anti_theft_system BOOLEAN,
    garage_parking BOOLEAN,
    previous_insurance_number VARCHAR(50)
);

-- OSAGO Applications
CREATE TABLE osago_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    application_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    calculated_amount DECIMAL(10,2),
    notes TEXT,
    car_make VARCHAR(100) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_year INTEGER NOT NULL,
    vin_number VARCHAR(17) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    registration_certificate VARCHAR(20) NOT NULL,
    driver_license_number VARCHAR(20) NOT NULL,
    driver_experience_years INTEGER NOT NULL,
    engine_power INTEGER NOT NULL,
    region_registration VARCHAR(100) NOT NULL,
    has_accidents_last_year BOOLEAN,
    previous_policy_number VARCHAR(50)
);

-- Travel Insurance Applications
CREATE TABLE travel_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    application_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    calculated_amount DECIMAL(10,2),
    notes TEXT,
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

-- Health Insurance Applications
CREATE TABLE health_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    application_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    calculated_amount DECIMAL(10,2),
    notes TEXT,
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

-- Property Insurance Applications
CREATE TABLE property_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    application_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    calculated_amount DECIMAL(10,2),
    notes TEXT,
    property_type VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    property_area DECIMAL(10,2) NOT NULL,
    year_built INTEGER NOT NULL,
    construction_type VARCHAR(100) NOT NULL,
    property_value DECIMAL(10,2) NOT NULL,
    has_security_system BOOLEAN,
    has_fire_alarm BOOLEAN,
    cover_natural_disasters BOOLEAN DEFAULT true,
    cover_theft BOOLEAN DEFAULT true,
    cover_third_party_liability BOOLEAN DEFAULT false,
    ownership_document_number VARCHAR(50) NOT NULL,
    cadastral_number VARCHAR(50) NOT NULL,
    has_mortage BOOLEAN,
    mortage_bank VARCHAR(200)
); 
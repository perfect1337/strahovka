DROP TABLE IF EXISTS kasko_applications CASCADE;

CREATE TABLE kasko_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    application_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'NEED_INFO')),
    car_make VARCHAR(255) NOT NULL,
    car_model VARCHAR(255) NOT NULL,
    car_year INTEGER NOT NULL CHECK (car_year >= 1900 AND car_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    vin_number VARCHAR(255) NOT NULL,
    license_plate VARCHAR(255) NOT NULL,
    car_value DECIMAL(19,2) NOT NULL CHECK (car_value > 0),
    driver_license_number VARCHAR(255) NOT NULL,
    driver_experience_years INTEGER NOT NULL CHECK (driver_experience_years >= 0),
    has_anti_theft_system BOOLEAN NOT NULL DEFAULT false,
    garage_parking BOOLEAN NOT NULL DEFAULT false,
    previous_insurance_number VARCHAR(255),
    duration INTEGER NOT NULL CHECK (duration > 0),
    calculated_amount DECIMAL(19,2) CHECK (calculated_amount > 0),
    notes TEXT,
    policy_id VARCHAR(255),
    approved_at TIMESTAMP,
    approved_by BIGINT REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejected_by BIGINT REFERENCES users(id),
    rejection_reason TEXT,
    processed_at TIMESTAMP,
    processed_by BIGINT REFERENCES users(id)
); 
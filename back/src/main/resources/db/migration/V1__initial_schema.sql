-- Users and Authentication
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    middle_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'ROLE_USER',
    level VARCHAR(20) DEFAULT 'WOODEN',
    policy_count INT DEFAULT 0,
    refresh_token VARCHAR(255),
    access_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Categories and Packages
CREATE TABLE insurance_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    base_price DECIMAL(10, 2),
    CONSTRAINT uk_insurance_categories_name UNIQUE (name)
);

CREATE TABLE insurance_packages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    baseprice DECIMAL(10, 2),
    discount DECIMAL(5, 2) DEFAULT 0,
    active BOOLEAN DEFAULT true
);

CREATE TABLE package_categories (
    package_id BIGINT REFERENCES insurance_packages(id),
    category_id BIGINT REFERENCES insurance_categories(id),
    PRIMARY KEY (package_id, category_id)
);

-- Insurance Guides
CREATE TABLE insurance_guides (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    insurance_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Policies
CREATE TABLE insurance_policies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    category_id BIGINT REFERENCES insurance_categories(id),
    guide_id BIGINT REFERENCES insurance_guides(id),
    policy_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    cancellation_date TIMESTAMP,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base Application Table
CREATE TABLE base_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    calculated_amount DECIMAL(10, 2),
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    notes TEXT,
    policy_id BIGINT REFERENCES insurance_policies(id),
    application_type VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE
);

-- KASKO Applications
CREATE TABLE kasko_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
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
    duration INTEGER NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    calculated_amount DECIMAL(10, 2),
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    approved_at TIMESTAMP,
    approved_by VARCHAR(255),
    rejected_at TIMESTAMP,
    rejected_by VARCHAR(255),
    rejection_reason TEXT,
    policy_id BIGINT REFERENCES insurance_policies(id)
);

-- OSAGO Applications
CREATE TABLE osago_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    car_make VARCHAR(255) NOT NULL,
    car_model VARCHAR(255) NOT NULL,
    car_year INTEGER NOT NULL,
    vin_number VARCHAR(17) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    driver_license_number VARCHAR(20) NOT NULL,
    driver_experience_years INTEGER NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    calculated_amount DECIMAL(10, 2),
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    policy_id BIGINT REFERENCES insurance_policies(id)
);

-- Travel Applications
CREATE TABLE travel_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    destination_country VARCHAR(255) NOT NULL,
    travel_start_date DATE NOT NULL,
    travel_end_date DATE NOT NULL,
    passport_number VARCHAR(20) NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    calculated_amount DECIMAL(10, 2),
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    policy_id BIGINT REFERENCES insurance_policies(id)
);

-- Health Applications
CREATE TABLE health_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    birth_date DATE NOT NULL,
    medical_conditions TEXT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    calculated_amount DECIMAL(10, 2),
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    policy_id BIGINT REFERENCES insurance_policies(id)
);

-- Property Applications
CREATE TABLE property_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    property_type VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    property_value DECIMAL(10, 2) NOT NULL,
    year_built INTEGER NOT NULL,
    security_system BOOLEAN DEFAULT false,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    calculated_amount DECIMAL(10, 2),
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    policy_id BIGINT REFERENCES insurance_policies(id)
);

-- Insurance Claims
CREATE TABLE insurance_claims (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT REFERENCES insurance_policies(id),
    user_id BIGINT REFERENCES users(id),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2),
    calculated_amount DECIMAL(10, 2),
    status VARCHAR(50) NOT NULL,
    claim_date DATE,
    response_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    resolution TEXT
);

CREATE TABLE claim_attachments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_data OID,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE claim_messages (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    user_id BIGINT REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE claim_comments (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT REFERENCES insurance_claims(id),
    user_id BIGINT REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 
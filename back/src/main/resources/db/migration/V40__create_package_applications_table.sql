-- Create package_applications table
CREATE TABLE package_applications (
    id BIGSERIAL PRIMARY KEY,
    package_id BIGINT REFERENCES insurance_packages(id),
    application_id BIGINT REFERENCES base_applications(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 
CREATE TABLE policy_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    package_id BIGINT NOT NULL REFERENCES insurance_packages(id),
    application_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    calculated_amount DECIMAL(10,2),
    notes TEXT,
    CONSTRAINT fk_policy_applications_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_policy_applications_package FOREIGN KEY (package_id) REFERENCES insurance_packages(id)
); 
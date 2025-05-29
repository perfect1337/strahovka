DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'insurance_applications'
    ) THEN
        CREATE TABLE insurance_applications (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id),
            type VARCHAR(50) NOT NULL,
            package_id BIGINT REFERENCES insurance_packages(id),
            passport_number VARCHAR(20) NOT NULL,
            passport_issued_by VARCHAR(255) NOT NULL,
            passport_issued_date DATE NOT NULL,
            birth_date DATE NOT NULL,
            address TEXT NOT NULL,
            additional_info TEXT,
            status VARCHAR(20) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT fk_application_user FOREIGN KEY (user_id) REFERENCES users(id),
            CONSTRAINT fk_application_package FOREIGN KEY (package_id) REFERENCES insurance_packages(id)
        );
    END IF;
END $$; 
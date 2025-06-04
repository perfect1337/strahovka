-- Consolidated changes from all migrations

-- Add missing columns to health_applications
ALTER TABLE health_applications 
    ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
    ADD COLUMN IF NOT EXISTS previous_insurance_history TEXT,
    ADD COLUMN IF NOT EXISTS coverage_amount DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS coverage_period INTEGER,
    ADD COLUMN IF NOT EXISTS chronic_diseases_details TEXT,
    ADD COLUMN IF NOT EXISTS disabilities_details TEXT,
    ADD COLUMN IF NOT EXISTS cover_dental BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cover_vision BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cover_maternity BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cover_emergency BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS coverage_type VARCHAR(255);

-- Add missing columns to insurance_packages
ALTER TABLE insurance_packages 
    ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS original_total_amount NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS package_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10, 2);

-- Modify column types
ALTER TABLE insurance_packages 
    ALTER COLUMN discount TYPE FLOAT USING discount::FLOAT,
    ALTER COLUMN original_total_amount TYPE NUMERIC(10, 2) USING original_total_amount::NUMERIC(10, 2);

-- Add missing columns to osago_applications
ALTER TABLE osago_applications 
    ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Make certain fields nullable for flexibility
ALTER TABLE insurance_packages 
    ALTER COLUMN baseprice DROP NOT NULL,
    ALTER COLUMN discount DROP NOT NULL,
    ALTER COLUMN final_amount DROP NOT NULL;

-- Add package relationships
ALTER TABLE base_applications 
    ADD COLUMN IF NOT EXISTS insurance_package_id BIGINT REFERENCES insurance_packages(id);

-- Update role constraints
ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_role_check,
    ADD CONSTRAINT users_role_check CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_AGENT'));

-- Add status and user tracking columns
ALTER TABLE base_applications 
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);

-- Add date tracking columns
ALTER TABLE base_applications 
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP; 
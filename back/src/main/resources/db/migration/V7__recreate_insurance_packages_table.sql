-- Create types if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'package_type') THEN
        CREATE TYPE package_type AS ENUM ('KASKO_OSAGO', 'PROPERTY_LIABILITY', 'HEALTH_TRAVEL', 'CUSTOM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'package_status') THEN
        CREATE TYPE package_status AS ENUM ('PENDING', 'PARTIALLY_COMPLETED', 'COMPLETED', 'CANCELLED');
    END IF;
END $$;

-- Create insurance_packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS insurance_packages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    original_total_amount DECIMAL(10,2),
    discount_percentage INTEGER NOT NULL,
    final_amount DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    package_type package_type NOT NULL,
    status package_status NOT NULL DEFAULT 'PENDING',
    CONSTRAINT insurance_packages_discount_percentage_check CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

-- Add reference columns if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kasko_applications' AND column_name = 'package_id') THEN
        ALTER TABLE kasko_applications ADD COLUMN package_id BIGINT REFERENCES insurance_packages(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'osago_applications' AND column_name = 'package_id') THEN
        ALTER TABLE osago_applications ADD COLUMN package_id BIGINT REFERENCES insurance_packages(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_applications' AND column_name = 'package_id') THEN
        ALTER TABLE property_applications ADD COLUMN package_id BIGINT REFERENCES insurance_packages(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'health_applications' AND column_name = 'package_id') THEN
        ALTER TABLE health_applications ADD COLUMN package_id BIGINT REFERENCES insurance_packages(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_applications' AND column_name = 'package_id') THEN
        ALTER TABLE travel_applications ADD COLUMN package_id BIGINT REFERENCES insurance_packages(id);
    END IF;
END $$; 
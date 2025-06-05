-- Консолидированные изменения для insurance_policies

ALTER TABLE insurance_policies
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS cashback DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS details TEXT,
    ADD COLUMN IF NOT EXISTS package_discount DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS package_name VARCHAR(255); 
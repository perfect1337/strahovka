-- Add created_at column to insurance_packages
ALTER TABLE insurance_packages
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP; 
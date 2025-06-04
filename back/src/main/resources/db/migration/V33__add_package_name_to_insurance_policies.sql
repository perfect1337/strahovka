-- Add package_name column to insurance_policies
ALTER TABLE insurance_policies
    ADD COLUMN IF NOT EXISTS package_name VARCHAR(255); 
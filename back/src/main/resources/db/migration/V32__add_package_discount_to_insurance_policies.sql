-- Add package_discount column to insurance_policies
ALTER TABLE insurance_policies
    ADD COLUMN IF NOT EXISTS package_discount INTEGER; 
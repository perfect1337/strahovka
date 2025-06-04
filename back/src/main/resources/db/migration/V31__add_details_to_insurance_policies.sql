-- Add details column to insurance_policies
ALTER TABLE insurance_policies
    ADD COLUMN IF NOT EXISTS details TEXT; 
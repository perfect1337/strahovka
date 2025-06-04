-- Add cashback column to insurance_policies
ALTER TABLE insurance_policies
    ADD COLUMN IF NOT EXISTS cashback NUMERIC(10,2); 
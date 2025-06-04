-- Add calculation_rules column to insurance_guides
ALTER TABLE insurance_guides
    ADD COLUMN IF NOT EXISTS calculation_rules TEXT; 
-- Add active column to insurance_guides
ALTER TABLE insurance_guides
    ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE; 
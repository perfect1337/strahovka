-- Add description column to insurance_guides
ALTER TABLE insurance_guides
    ADD COLUMN IF NOT EXISTS description TEXT; 
-- Add important_notes column to insurance_guides
ALTER TABLE insurance_guides
    ADD COLUMN IF NOT EXISTS important_notes TEXT; 
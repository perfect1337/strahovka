-- Add coverage_details column to insurance_guides
ALTER TABLE insurance_guides
    ADD COLUMN IF NOT EXISTS coverage_details TEXT; 
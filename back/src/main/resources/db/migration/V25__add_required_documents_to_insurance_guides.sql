-- Add required_documents column to insurance_guides
ALTER TABLE insurance_guides
    ADD COLUMN IF NOT EXISTS required_documents TEXT; 
-- Add status column to insurance_policies
ALTER TABLE insurance_policies
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE'; 
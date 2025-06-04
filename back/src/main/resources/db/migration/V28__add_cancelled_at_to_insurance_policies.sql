-- Add cancelled_at column to insurance_policies
ALTER TABLE insurance_policies
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP; 
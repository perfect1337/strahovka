-- Add active column to insurance_policies table if it doesn't exist
ALTER TABLE insurance_policies
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE; 
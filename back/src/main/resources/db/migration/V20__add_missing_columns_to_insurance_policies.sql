-- Add missing columns to insurance_policies table
ALTER TABLE insurance_policies
ADD COLUMN IF NOT EXISTS description VARCHAR(1000) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true; 
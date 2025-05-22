-- Add missing columns to insurance_claims table
ALTER TABLE insurance_claims
ADD COLUMN IF NOT EXISTS response TEXT,
ADD COLUMN IF NOT EXISTS response_date TIMESTAMP;

-- Add missing columns to insurance_policies table
ALTER TABLE insurance_policies
ADD COLUMN IF NOT EXISTS cashback DECIMAL(10, 2) DEFAULT 0.0; 
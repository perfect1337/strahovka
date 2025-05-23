-- Add claim processing columns
ALTER TABLE insurance_claims
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS processed_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS response TEXT,
ADD COLUMN IF NOT EXISTS claim_date DATE,
ADD COLUMN IF NOT EXISTS response_date DATE,
ADD COLUMN IF NOT EXISTS calculated_amount DECIMAL(10,2); 
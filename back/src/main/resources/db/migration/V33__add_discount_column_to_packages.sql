-- Add the discount column to insurance_packages table
ALTER TABLE insurance_packages ADD COLUMN IF NOT EXISTS discount INTEGER NOT NULL DEFAULT 0; 
-- Add package_type column
ALTER TABLE insurance_packages
ADD COLUMN package_type VARCHAR(50);

-- Set default value for existing records
UPDATE insurance_packages
SET package_type = 'CUSTOM';

-- Make package_type not nullable
ALTER TABLE insurance_packages
ALTER COLUMN package_type SET NOT NULL; 
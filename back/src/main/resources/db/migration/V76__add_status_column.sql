-- Add status column
ALTER TABLE insurance_packages
ADD COLUMN status VARCHAR(50);

-- Set default value for existing records
UPDATE insurance_packages
SET status = 'PENDING';

-- Make status not nullable
ALTER TABLE insurance_packages
ALTER COLUMN status SET NOT NULL; 
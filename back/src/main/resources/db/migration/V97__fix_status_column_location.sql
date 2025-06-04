-- First, add the status column to base_applications if it doesn't exist
ALTER TABLE base_applications ADD COLUMN IF NOT EXISTS status VARCHAR(255);

-- Update the status in base_applications from kasko_applications
UPDATE base_applications ba
SET status = 'PENDING'
FROM kasko_applications ka
WHERE ba.id = ka.id AND ba.status IS NULL;

-- Update any remaining NULL statuses to 'PENDING'
UPDATE base_applications SET status = 'PENDING' WHERE status IS NULL;

-- Make the status column non-nullable
ALTER TABLE base_applications ALTER COLUMN status SET NOT NULL;

-- Drop the status column from kasko_applications if it exists
ALTER TABLE kasko_applications DROP COLUMN IF EXISTS status; 
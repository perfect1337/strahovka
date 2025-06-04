-- First, migrate any existing status values from health_applications to base_applications
UPDATE base_applications ba
SET status = ha.status
FROM health_applications ha
WHERE ba.id = ha.id AND ba.status IS NULL;

-- Then remove the status column from health_applications
ALTER TABLE health_applications DROP COLUMN IF EXISTS status;

-- Ensure all base_applications have a status
UPDATE base_applications SET status = 'PENDING' WHERE status IS NULL;

-- Make the status column non-nullable in base_applications
ALTER TABLE base_applications ALTER COLUMN status SET NOT NULL; 
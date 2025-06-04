-- First, ensure base_applications has a status column with the correct type and default
ALTER TABLE base_applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';

-- Migrate any existing status values from all application-specific tables to base_applications
UPDATE base_applications ba
SET status = COALESCE(
    (SELECT status FROM travel_applications ta WHERE ta.id = ba.id),
    (SELECT status FROM kasko_applications ka WHERE ka.id = ba.id),
    (SELECT status FROM osago_applications oa WHERE oa.id = ba.id),
    (SELECT status FROM property_applications pa WHERE pa.id = ba.id),
    (SELECT status FROM health_applications ha WHERE ha.id = ba.id),
    'PENDING'
)
WHERE ba.status IS NULL;

-- Update any remaining NULL statuses to 'PENDING'
UPDATE base_applications SET status = 'PENDING' WHERE status IS NULL;

-- Make the status column non-nullable in base_applications
ALTER TABLE base_applications ALTER COLUMN status SET NOT NULL;

-- Drop the status column from all application-specific tables
ALTER TABLE travel_applications DROP COLUMN IF EXISTS status;
ALTER TABLE kasko_applications DROP COLUMN IF EXISTS status;
ALTER TABLE osago_applications DROP COLUMN IF EXISTS status;
ALTER TABLE property_applications DROP COLUMN IF EXISTS status;
ALTER TABLE health_applications DROP COLUMN IF EXISTS status;

-- Ensure base_applications has the correct default value
ALTER TABLE base_applications ALTER COLUMN status SET DEFAULT 'PENDING';
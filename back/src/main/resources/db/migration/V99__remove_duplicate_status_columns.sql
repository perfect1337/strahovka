-- First, migrate any existing status values from specific application tables to base_applications
UPDATE base_applications ba
SET status = COALESCE(
    (SELECT status FROM travel_applications WHERE id = ba.id),
    (SELECT status FROM kasko_applications WHERE id = ba.id),
    (SELECT status FROM osago_applications WHERE id = ba.id),
    (SELECT status FROM property_applications WHERE id = ba.id),
    (SELECT status FROM health_applications WHERE id = ba.id),
    'PENDING'
)
WHERE ba.status IS NULL;

-- Then remove the status column from all application-specific tables
ALTER TABLE travel_applications DROP COLUMN IF EXISTS status;
ALTER TABLE kasko_applications DROP COLUMN IF EXISTS status;
ALTER TABLE osago_applications DROP COLUMN IF EXISTS status;
ALTER TABLE property_applications DROP COLUMN IF EXISTS status;
ALTER TABLE health_applications DROP COLUMN IF EXISTS status;

-- Ensure all base_applications have a status
UPDATE base_applications SET status = 'PENDING' WHERE status IS NULL;

-- Make the status column non-nullable in base_applications if it isn't already
ALTER TABLE base_applications ALTER COLUMN status SET NOT NULL; 
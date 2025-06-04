-- First, ensure base_applications has a status column
ALTER TABLE base_applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING' NOT NULL;

-- Migrate any existing status values from specific application tables to base_applications
UPDATE base_applications ba
SET status = COALESCE(
    (SELECT status FROM travel_applications ta WHERE ta.id = ba.id),
    (SELECT status FROM kasko_applications ka WHERE ka.id = ba.id),
    (SELECT status FROM osago_applications oa WHERE oa.id = ba.id),
    (SELECT status FROM property_applications pa WHERE pa.id = ba.id),
    (SELECT status FROM health_applications ha WHERE ha.id = ba.id),
    'PENDING'
);

-- Remove status columns from specific application tables
ALTER TABLE travel_applications DROP COLUMN IF EXISTS status;
ALTER TABLE kasko_applications DROP COLUMN IF EXISTS status;
ALTER TABLE osago_applications DROP COLUMN IF EXISTS status;
ALTER TABLE property_applications DROP COLUMN IF EXISTS status;
ALTER TABLE health_applications DROP COLUMN IF EXISTS status; 
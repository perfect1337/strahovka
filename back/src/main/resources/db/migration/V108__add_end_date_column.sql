-- Add endDate column to base_applications table
ALTER TABLE base_applications ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP;

-- Copy existing end_date values if they exist (in case the column was previously named differently)
UPDATE base_applications ba
SET "endDate" = COALESCE(
    (SELECT end_date FROM kasko_applications ka WHERE ka.id = ba.id),
    (SELECT end_date FROM osago_applications oa WHERE oa.id = ba.id),
    (SELECT end_date FROM property_applications pa WHERE pa.id = ba.id),
    (SELECT end_date FROM health_applications ha WHERE ha.id = ba.id),
    (SELECT end_date FROM travel_applications ta WHERE ta.id = ba.id)
); 
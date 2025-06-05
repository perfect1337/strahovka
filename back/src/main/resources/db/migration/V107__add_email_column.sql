-- Add email column to base_applications table
ALTER TABLE base_applications ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Copy existing email values if they exist (in case the column was previously named differently)
UPDATE base_applications ba
SET email = COALESCE(
    (SELECT email FROM kasko_applications ka WHERE ka.id = ba.id),
    (SELECT email FROM osago_applications oa WHERE oa.id = ba.id),
    (SELECT email FROM property_applications pa WHERE pa.id = ba.id),
    (SELECT email FROM health_applications ha WHERE ha.id = ba.id),
    (SELECT email FROM travel_applications ta WHERE ta.id = ba.id)
); 
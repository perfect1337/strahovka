-- Add application_type column to package_applications table if it doesn't exist
ALTER TABLE package_applications 
ADD COLUMN IF NOT EXISTS application_type VARCHAR(50);

-- Update application_type based on the type of application
UPDATE package_applications pa
SET application_type = CASE 
    WHEN EXISTS (SELECT 1 FROM kasko_applications ka WHERE ka.id = pa.application_id) THEN 'KASKO'
    WHEN EXISTS (SELECT 1 FROM osago_applications oa WHERE oa.id = pa.application_id) THEN 'OSAGO'
    WHEN EXISTS (SELECT 1 FROM property_applications pra WHERE pra.id = pa.application_id) THEN 'PROPERTY'
    WHEN EXISTS (SELECT 1 FROM health_applications ha WHERE ha.id = pa.application_id) THEN 'HEALTH'
    WHEN EXISTS (SELECT 1 FROM travel_applications ta WHERE ta.id = pa.application_id) THEN 'TRAVEL'
    ELSE NULL
END; 
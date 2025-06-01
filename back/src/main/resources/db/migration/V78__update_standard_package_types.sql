-- Update any existing STANDARD package types to CUSTOM
UPDATE insurance_packages
SET package_type = 'CUSTOM'
WHERE package_type = 'STANDARD'; 
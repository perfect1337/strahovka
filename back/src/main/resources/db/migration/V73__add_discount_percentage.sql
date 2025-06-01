-- Add discount_percentage column
ALTER TABLE insurance_packages
ADD COLUMN discount_percentage INTEGER;

-- Update discount_percentage with values from discount column
UPDATE insurance_packages
SET discount_percentage = discount;

-- Make discount_percentage not nullable
ALTER TABLE insurance_packages
ALTER COLUMN discount_percentage SET NOT NULL; 
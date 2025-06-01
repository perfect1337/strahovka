-- Add original_total_amount column
ALTER TABLE insurance_packages
ADD COLUMN original_total_amount DECIMAL(10,2);

-- Add final_amount column
ALTER TABLE insurance_packages
ADD COLUMN final_amount DECIMAL(10,2);

-- Set default values
UPDATE insurance_packages
SET original_total_amount = 0,
    final_amount = 0;

-- Make columns not nullable
ALTER TABLE insurance_packages
ALTER COLUMN original_total_amount SET NOT NULL,
ALTER COLUMN final_amount SET NOT NULL; 
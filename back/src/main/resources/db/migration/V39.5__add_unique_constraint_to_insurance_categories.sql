-- Add unique constraint to insurance_categories name column
ALTER TABLE insurance_categories ADD CONSTRAINT uk_insurance_categories_name UNIQUE (name); 
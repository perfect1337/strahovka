-- Fix package_discount column type in insurance_policies table
ALTER TABLE insurance_policies ALTER COLUMN package_discount TYPE INTEGER USING package_discount::INTEGER; 
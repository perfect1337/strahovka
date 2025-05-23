-- Add category_id column to insurance_policies table
ALTER TABLE insurance_policies
ADD COLUMN IF NOT EXISTS category_id BIGINT,
ADD CONSTRAINT fk_insurance_policies_category
    FOREIGN KEY (category_id)
    REFERENCES insurance_categories(id); 
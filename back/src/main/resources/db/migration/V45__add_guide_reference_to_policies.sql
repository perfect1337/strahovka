-- Add guide_id column to insurance_policies table
ALTER TABLE insurance_policies
ADD COLUMN guide_id BIGINT,
ADD CONSTRAINT fk_insurance_policies_guide
    FOREIGN KEY (guide_id)
    REFERENCES insurance_guides(id);

-- Update existing policies with corresponding guides based on category type
UPDATE insurance_policies ip
SET guide_id = ig.id
FROM insurance_guides ig
JOIN insurance_categories ic ON ic.type = ig.insurance_type
WHERE ip.category_id = ic.id; 
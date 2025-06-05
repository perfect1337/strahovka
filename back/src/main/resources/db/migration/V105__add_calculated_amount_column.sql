-- Add calculatedAmount column to base_applications table
ALTER TABLE base_applications ADD COLUMN IF NOT EXISTS "calculatedAmount" DECIMAL(10, 2);

-- Copy existing calculated_amount values if they exist (in case the column was previously named differently)
UPDATE base_applications ba
SET "calculatedAmount" = COALESCE(
    (SELECT calculated_amount FROM kasko_applications ka WHERE ka.id = ba.id),
    (SELECT calculated_amount FROM osago_applications oa WHERE oa.id = ba.id),
    (SELECT calculated_amount FROM property_applications pa WHERE pa.id = ba.id),
    (SELECT calculated_amount FROM health_applications ha WHERE ha.id = ba.id),
    (SELECT calculated_amount FROM travel_applications ta WHERE ta.id = ba.id)
); 
-- Fix insurance_claims table
ALTER TABLE insurance_claims 
    RENAME COLUMN IF EXISTS calculatedamount TO calculated_amount,
    RENAME COLUMN IF EXISTS claimdate TO claim_date,
    RENAME COLUMN IF EXISTS responsedate TO response_date;

-- Fix insurance_policies table
ALTER TABLE insurance_policies 
    RENAME COLUMN IF EXISTS "name" TO policy_name,
    RENAME COLUMN IF EXISTS startdate TO start_date,
    RENAME COLUMN IF EXISTS enddate TO end_date,
    RENAME COLUMN IF EXISTS categoryid TO category_id,
    RENAME COLUMN IF EXISTS userid TO user_id; 
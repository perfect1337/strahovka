-- Fix insurance_claims table
DO $$
BEGIN
    -- Rename calculatedamount if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_claims' AND column_name = 'calculatedamount') THEN
        ALTER TABLE insurance_claims RENAME COLUMN calculatedamount TO calculated_amount;
    END IF;

    -- Rename claimdate if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_claims' AND column_name = 'claimdate') THEN
        ALTER TABLE insurance_claims RENAME COLUMN claimdate TO claim_date;
    END IF;

    -- Rename responsedate if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_claims' AND column_name = 'responsedate') THEN
        ALTER TABLE insurance_claims RENAME COLUMN responsedate TO response_date;
    END IF;
END $$;

-- Fix insurance_policies table
DO $$
BEGIN
    -- Rename name if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_policies' AND column_name = 'name') THEN
        ALTER TABLE insurance_policies RENAME COLUMN "name" TO policy_name;
    END IF;

    -- Rename startdate if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_policies' AND column_name = 'startdate') THEN
        ALTER TABLE insurance_policies RENAME COLUMN startdate TO start_date;
    END IF;

    -- Rename enddate if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_policies' AND column_name = 'enddate') THEN
        ALTER TABLE insurance_policies RENAME COLUMN enddate TO end_date;
    END IF;

    -- Rename categoryid if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_policies' AND column_name = 'categoryid') THEN
        ALTER TABLE insurance_policies RENAME COLUMN categoryid TO category_id;
    END IF;

    -- Rename userid if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_policies' AND column_name = 'userid') THEN
        ALTER TABLE insurance_policies RENAME COLUMN userid TO user_id;
    END IF;
END $$; 
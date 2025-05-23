-- Rename claim_date and response_date columns if they exist in camelCase
DO $$
BEGIN
    -- Check and rename claimDate to claim_date
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_claims' 
               AND column_name = 'claimdate') THEN
        ALTER TABLE insurance_claims RENAME COLUMN claimdate TO claim_date;
    END IF;

    -- Check and rename responseDate to response_date
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_claims' 
               AND column_name = 'responsedate') THEN
        ALTER TABLE insurance_claims RENAME COLUMN responsedate TO response_date;
    END IF;

    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_claims' 
                  AND column_name = 'claim_date') THEN
        ALTER TABLE insurance_claims ADD COLUMN claim_date TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_claims' 
                  AND column_name = 'response_date') THEN
        ALTER TABLE insurance_claims ADD COLUMN response_date TIMESTAMP;
    END IF;
END $$; 
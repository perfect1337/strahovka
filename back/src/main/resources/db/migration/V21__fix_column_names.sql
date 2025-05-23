-- Add missing details column to insurance_policies table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_policies' 
                  AND column_name = 'details') THEN
        ALTER TABLE insurance_policies ADD COLUMN details TEXT;
    END IF;
END $$;

-- Rename claimDate to claim_date in insurance_claims table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_claims' 
               AND column_name = 'claimdate') THEN
        ALTER TABLE insurance_claims RENAME COLUMN claimdate TO claim_date;
    END IF;
END $$; 
-- Check if claim_date already exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='insurance_claims' AND column_name='claimdate'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='insurance_claims' AND column_name='claim_date'
    ) THEN
        ALTER TABLE insurance_claims RENAME COLUMN claimdate TO claim_date;
    END IF;
END $$; 
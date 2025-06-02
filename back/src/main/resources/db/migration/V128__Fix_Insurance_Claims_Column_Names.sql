DO $$ 
BEGIN
    -- Check if createdAt column exists and rename it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'insurance_claims' 
        AND column_name = 'createdat'
    ) THEN
        ALTER TABLE insurance_claims RENAME COLUMN "createdAt" TO created_at;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'insurance_claims' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE insurance_claims ADD COLUMN created_at TIMESTAMP;
    END IF;
END $$; 
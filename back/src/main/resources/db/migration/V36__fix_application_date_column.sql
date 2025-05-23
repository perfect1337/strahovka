DO $$
BEGIN
    -- Check if the column exists with the old name
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'policy_applications'
        AND column_name = 'applicationdate'
    ) THEN
        -- Rename the column if it exists
        ALTER TABLE policy_applications 
        RENAME COLUMN applicationdate TO application_date;
    END IF;
END $$; 
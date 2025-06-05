-- Add applicationDate column if it doesn't exist
DO $$ 
BEGIN
    -- Check if application_date exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'base_applications' 
        AND column_name = 'application_date'
    ) THEN
        -- Rename application_date to applicationDate
        ALTER TABLE base_applications RENAME COLUMN application_date TO "applicationDate";
    ELSE
        -- Check if applicationDate doesn't exist before adding it
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'base_applications' 
            AND column_name = 'applicationDate'
        ) THEN
            -- Add applicationDate column
            ALTER TABLE base_applications ADD COLUMN "applicationDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;
END $$;

-- Ensure the column has the correct type and default value
ALTER TABLE base_applications ALTER COLUMN "applicationDate" TYPE TIMESTAMP USING "applicationDate"::TIMESTAMP;
ALTER TABLE base_applications ALTER COLUMN "applicationDate" SET DEFAULT CURRENT_TIMESTAMP; 
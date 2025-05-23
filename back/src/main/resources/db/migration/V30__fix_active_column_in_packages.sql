-- Drop and recreate the active column with proper type and default value
DO $$
BEGIN
    -- Drop the column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_packages' 
               AND column_name = 'active') THEN
        ALTER TABLE insurance_packages DROP COLUMN active;
    END IF;
END $$;

-- Add the active column with proper type and default value
ALTER TABLE insurance_packages ADD COLUMN active BOOLEAN NOT NULL DEFAULT true; 
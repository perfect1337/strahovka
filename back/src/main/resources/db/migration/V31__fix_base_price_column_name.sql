-- Fix the base_price column name to match the entity field
DO $$
BEGIN
    -- Rename the column if it exists with a different case
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_packages' 
               AND column_name = 'base_price') THEN
        ALTER TABLE insurance_packages RENAME COLUMN base_price TO baseprice;
    END IF;

    -- Add the column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_packages' 
                  AND column_name = 'baseprice') THEN
        ALTER TABLE insurance_packages ADD COLUMN baseprice DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;
END $$; 
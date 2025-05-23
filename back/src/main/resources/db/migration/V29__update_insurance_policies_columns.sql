-- Rename name column to policy_name if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'insurance_policies' 
               AND column_name = 'name') THEN
        ALTER TABLE insurance_policies RENAME COLUMN name TO policy_name;
    ELSE
        -- Add policy_name column if neither name nor policy_name exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'insurance_policies' 
                      AND column_name = 'policy_name') THEN
            ALTER TABLE insurance_policies ADD COLUMN policy_name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Policy';
        END IF;
    END IF;
END $$;

-- Add other missing columns if they don't exist
DO $$
BEGIN
    -- Add description if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_policies' 
                  AND column_name = 'description') THEN
        ALTER TABLE insurance_policies ADD COLUMN description TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add price if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_policies' 
                  AND column_name = 'price') THEN
        ALTER TABLE insurance_policies ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;

    -- Add cashback if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_policies' 
                  AND column_name = 'cashback') THEN
        ALTER TABLE insurance_policies ADD COLUMN cashback DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;

    -- Add start_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_policies' 
                  AND column_name = 'start_date') THEN
        ALTER TABLE insurance_policies ADD COLUMN start_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;

    -- Add end_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_policies' 
                  AND column_name = 'end_date') THEN
        ALTER TABLE insurance_policies ADD COLUMN end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year');
    END IF;

    -- Add status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'insurance_policies' 
                  AND column_name = 'status') THEN
        ALTER TABLE insurance_policies ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
    END IF;
END $$; 
-- First check if policyId column exists and rename it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'base_applications'
        AND column_name = 'policyId'
    ) THEN
        ALTER TABLE base_applications RENAME COLUMN "policyId" TO policy_id;
    ELSE
        -- If policyId doesn't exist, check if policy_id exists
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'base_applications'
            AND column_name = 'policy_id'
        ) THEN
            -- Add policy_id column if neither exists
            ALTER TABLE base_applications ADD COLUMN policy_id BIGINT REFERENCES insurance_policies(id);
        END IF;
    END IF;
END $$; 
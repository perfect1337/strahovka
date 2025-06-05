-- First check if policy_id column exists and rename it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'base_applications'
        AND column_name = 'policy_id'
    ) THEN
        ALTER TABLE base_applications RENAME COLUMN policy_id TO "policyId";
    ELSE
        -- If policy_id doesn't exist, check if policyId exists
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'base_applications'
            AND column_name = 'policyId'
        ) THEN
            -- Add policyId column if neither exists
            ALTER TABLE base_applications ADD COLUMN "policyId" BIGINT REFERENCES insurance_policies(id);
        END IF;
    END IF;
END $$; 
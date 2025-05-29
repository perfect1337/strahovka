DO $$
BEGIN
    -- Create a temporary column with the correct type
    ALTER TABLE kasko_applications ADD COLUMN policy_id_new BIGINT;

    -- Update the new column with converted values
    UPDATE kasko_applications
    SET policy_id_new = CASE 
        WHEN policy_id ~ '^\d+$' THEN policy_id::bigint 
        ELSE NULL 
    END;

    -- Drop the old column
    ALTER TABLE kasko_applications DROP COLUMN policy_id;

    -- Rename the new column to the original name
    ALTER TABLE kasko_applications RENAME COLUMN policy_id_new TO policy_id;
END $$; 
DO $$
BEGIN
    -- Drop the foreign key constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'kasko_applications_processed_by_fkey'
    ) THEN
        ALTER TABLE kasko_applications DROP CONSTRAINT kasko_applications_processed_by_fkey;
    END IF;

    -- Create a temporary table to store the id->email mapping
    CREATE TEMP TABLE user_email_mapping AS
    SELECT id, email FROM users;

    -- Add an index to speed up the lookup
    CREATE INDEX ON user_email_mapping (id);

    -- Create a new column for the email
    ALTER TABLE kasko_applications ADD COLUMN processed_by_email VARCHAR(255);

    -- Update the new column with email values
    UPDATE kasko_applications ka
    SET processed_by_email = uem.email
    FROM user_email_mapping uem
    WHERE ka.processed_by::bigint = uem.id;

    -- Drop the old column
    ALTER TABLE kasko_applications DROP COLUMN processed_by;

    -- Rename the new column to the original name
    ALTER TABLE kasko_applications RENAME COLUMN processed_by_email TO processed_by;

    -- Drop the temporary table
    DROP TABLE user_email_mapping;
END $$; 
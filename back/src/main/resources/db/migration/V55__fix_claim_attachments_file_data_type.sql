DO $$
BEGIN
    -- Change the column type to BYTEA
    ALTER TABLE claim_attachments 
        ALTER COLUMN file_data TYPE BYTEA USING file_data::BYTEA;
END $$; 
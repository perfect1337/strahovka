DO $$ 
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'claim_attachments') THEN
        CREATE TABLE claim_attachments (
            id BIGSERIAL PRIMARY KEY,
            claim_id BIGINT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_type VARCHAR(255) NOT NULL,
            file_size BIGINT NOT NULL,
            file_data BYTEA NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_claim_attachments_claim
                FOREIGN KEY (claim_id)
                REFERENCES insurance_claims(id)
                ON DELETE CASCADE
        );
    ELSE
        -- Add any missing columns if the table exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claim_attachments' AND column_name = 'file_size') THEN
            ALTER TABLE claim_attachments ADD COLUMN file_size BIGINT NOT NULL DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'claim_attachments' AND column_name = 'created_at') THEN
            ALTER TABLE claim_attachments ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;
END $$; 
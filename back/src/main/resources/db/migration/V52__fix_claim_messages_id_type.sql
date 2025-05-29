DO $$
BEGIN
    -- Create a new sequence if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'claim_messages_id_seq') THEN
        CREATE SEQUENCE claim_messages_id_seq;
    END IF;

    -- Update the column type and set the default value
    ALTER TABLE claim_messages 
        ALTER COLUMN id TYPE BIGINT USING id::BIGINT,
        ALTER COLUMN id SET DEFAULT nextval('claim_messages_id_seq');

    -- Set the sequence value to the maximum id
    PERFORM setval('claim_messages_id_seq', COALESCE((SELECT MAX(id) FROM claim_messages), 0));
END $$; 
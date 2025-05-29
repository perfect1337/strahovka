DO $$
BEGIN
    -- Create a new sequence if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'insurance_guides_id_seq') THEN
        CREATE SEQUENCE insurance_guides_id_seq;
    END IF;

    -- Update the column type and set the default value
    ALTER TABLE insurance_guides 
        ALTER COLUMN id TYPE BIGINT USING id::BIGINT,
        ALTER COLUMN id SET DEFAULT nextval('insurance_guides_id_seq');

    -- Set the sequence value to the maximum id
    PERFORM setval('insurance_guides_id_seq', COALESCE((SELECT MAX(id) FROM insurance_guides), 0));
END $$; 
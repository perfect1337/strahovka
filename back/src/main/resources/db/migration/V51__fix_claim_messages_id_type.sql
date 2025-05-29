ALTER TABLE claim_messages 
ALTER COLUMN id TYPE BIGINT,
ALTER COLUMN id SET DEFAULT nextval('claim_messages_id_seq'); 
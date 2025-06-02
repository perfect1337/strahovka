-- Drop the existing sequence if it exists
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;

-- Create a new sequence
CREATE SEQUENCE users_id_seq;

-- Set the sequence to the maximum ID value currently in the table
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0));

-- Alter the users table to use the new sequence
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
ALTER SEQUENCE users_id_seq OWNED BY users.id; 
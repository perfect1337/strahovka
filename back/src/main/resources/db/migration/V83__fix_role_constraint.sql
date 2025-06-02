-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;

-- Add new constraint that accepts both formats
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('USER', 'ADMIN', 'MODERATOR', 'ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR')); 
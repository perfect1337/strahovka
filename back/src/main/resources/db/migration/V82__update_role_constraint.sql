-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;

-- Add new constraint that accepts both formats
ALTER TABLE users ADD CONSTRAINT check_valid_role 
CHECK (role IN ('USER', 'ADMIN', 'MODERATOR', 'ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR')); 
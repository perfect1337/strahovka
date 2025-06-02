-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint that accepts roles without ROLE_ prefix
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')); 
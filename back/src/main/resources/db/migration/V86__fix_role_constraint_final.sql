-- Drop all existing role constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;

-- Add new constraint that matches the Role enum exactly
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')); 
-- Drop existing role constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;

-- Update existing roles to match the Role enum values
UPDATE users SET role = 'USER' WHERE role = 'ROLE_USER';
UPDATE users SET role = 'ADMIN' WHERE role = 'ROLE_ADMIN';
UPDATE users SET role = 'MODERATOR' WHERE role = 'ROLE_MODERATOR';

-- Drop the default value
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Add new constraint that matches the Role enum exactly
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('USER', 'ADMIN', 'MODERATOR'));

-- Set new default value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'; 
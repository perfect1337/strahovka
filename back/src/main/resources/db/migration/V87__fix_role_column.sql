-- Drop existing role constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Update existing roles to match the Java enum values
UPDATE users SET role = 'USER' WHERE role = 'ROLE_USER';
UPDATE users SET role = 'ADMIN' WHERE role = 'ROLE_ADMIN';
UPDATE users SET role = 'MODERATOR' WHERE role = 'ROLE_MODERATOR';

-- Add new constraint that matches the Role enum
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('USER', 'ADMIN', 'MODERATOR'));

-- Set default value to match Java code
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'; 
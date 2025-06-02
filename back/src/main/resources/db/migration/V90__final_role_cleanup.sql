-- Attempt to drop all known previous role constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;

-- Ensure the column type is VARCHAR and suitable for storing role strings
-- This also helps reset any potential underlying enum type issues if they existed
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255);

-- Update existing roles to remove ROLE_ prefix and ensure consistency
UPDATE users SET role = 'USER' WHERE role = 'ROLE_USER';
UPDATE users SET role = 'ADMIN' WHERE role = 'ROLE_ADMIN';
UPDATE users SET role = 'MODERATOR' WHERE role = 'ROLE_MODERATOR';

-- Remove any existing default value for the role column
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Add the definitive check constraint for roles
ALTER TABLE users ADD CONSTRAINT users_role_check
CHECK (role IN ('USER', 'ADMIN', 'MODERATOR'));

-- Set the new default value for the role column
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'; 
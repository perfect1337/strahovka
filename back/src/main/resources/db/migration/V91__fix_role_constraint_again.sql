-- Drop any existing role-related constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;

-- First, ensure the column is the correct type
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255);

-- Remove any existing default
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Update any existing roles to ensure they match our enum exactly
UPDATE users SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN', 'MODERATOR');

-- Add the constraint with exact matching to our Role enum
ALTER TABLE users ADD CONSTRAINT users_role_check
CHECK (role IN ('USER', 'ADMIN', 'MODERATOR'));

-- Set the default role
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';

-- Verify there are no invalid roles
UPDATE users SET role = 'USER' WHERE role IS NULL; 
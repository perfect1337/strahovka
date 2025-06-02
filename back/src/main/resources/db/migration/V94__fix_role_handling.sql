-- First, drop any existing role-related constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;

-- Drop any existing role enum type
DROP TYPE IF EXISTS user_role_enum CASCADE;

-- Temporarily change the column to text to avoid any type conflicts
ALTER TABLE users ALTER COLUMN role TYPE text USING role::text;

-- Update any existing roles to ensure they match our enum values exactly
UPDATE users SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN', 'MODERATOR');

-- Now add the constraint back with the correct values
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'MODERATOR'));

-- Set the default value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'; 
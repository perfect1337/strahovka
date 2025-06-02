-- Drop the existing role check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Drop any existing role enum type (if it exists)
DROP TYPE IF EXISTS user_role_enum CASCADE;

-- Create a new enum type for roles
CREATE TYPE user_role_enum AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- Temporarily change the role column to text to avoid any type conflicts
ALTER TABLE users ALTER COLUMN role TYPE text;

-- Update any existing roles to ensure they match our enum values
UPDATE users SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN', 'MODERATOR');

-- Change the column type to use the new enum
ALTER TABLE users ALTER COLUMN role TYPE user_role_enum USING role::user_role_enum;

-- Add a default value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'; 
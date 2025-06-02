-- Drop the existing role check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Drop any existing role enum type (if it exists)
DROP TYPE IF EXISTS user_role_enum CASCADE;

-- Create a new enum type for roles
CREATE TYPE user_role_enum AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- Add a new column for the role enum
ALTER TABLE users ADD COLUMN role_enum user_role_enum DEFAULT 'USER';

-- Update the new column based on the old role values
UPDATE users SET role_enum = 'USER'::user_role_enum WHERE role NOT IN ('USER', 'ADMIN', 'MODERATOR') OR role IS NULL;
UPDATE users SET role_enum = role::user_role_enum WHERE role IN ('USER', 'ADMIN', 'MODERATOR');
UPDATE users SET role_enum = UPPER(role)::user_role_enum WHERE role IN ('user', 'admin', 'moderator');

-- Drop the old role column
ALTER TABLE users DROP COLUMN role;

-- Rename the new column to role
ALTER TABLE users RENAME COLUMN role_enum TO role;

-- Make the role column NOT NULL
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- Set the default value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'::user_role_enum; 
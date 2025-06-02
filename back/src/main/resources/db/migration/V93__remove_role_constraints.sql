-- Drop all possible role constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;

-- Drop any existing role enum type
DROP TYPE IF EXISTS user_role_enum CASCADE;

-- Make sure the column is VARCHAR without any constraints
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255);

-- Remove any default value
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Update any existing roles to ensure they match our enum values
UPDATE users SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN', 'MODERATOR');

-- Set default value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'; 
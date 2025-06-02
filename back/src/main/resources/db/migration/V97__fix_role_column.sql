-- Drop existing constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Temporarily change the column to text to avoid any type conflicts
ALTER TABLE users ALTER COLUMN role TYPE text;

-- Update any null or invalid roles to 'USER'
UPDATE users SET role = 'USER' WHERE role IS NULL OR role NOT IN ('USER', 'ADMIN', 'MODERATOR');

-- Add NOT NULL constraint
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- Add the check constraint
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')); 
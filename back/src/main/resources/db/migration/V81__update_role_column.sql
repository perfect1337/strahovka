-- Drop the default value constraint
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Update existing roles to remove ROLE_ prefix
UPDATE users SET role = 'USER' WHERE role = 'ROLE_USER';
UPDATE users SET role = 'ADMIN' WHERE role = 'ROLE_ADMIN';
UPDATE users SET role = 'MODERATOR' WHERE role = 'ROLE_MODERATOR';

-- Add check constraint for valid roles
ALTER TABLE users ADD CONSTRAINT check_valid_role CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')); 
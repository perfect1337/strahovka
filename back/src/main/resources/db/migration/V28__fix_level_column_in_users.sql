-- Drop and recreate the level column with proper type and default value
ALTER TABLE users DROP COLUMN IF EXISTS level;
ALTER TABLE users ADD COLUMN level VARCHAR(255) NOT NULL DEFAULT 'WOODEN';

-- Update existing rows to have a valid level
UPDATE users SET level = 'WOODEN' WHERE level IS NULL OR level = '';

-- Add check constraint to ensure only valid levels
ALTER TABLE users ADD CONSTRAINT chk_user_level 
CHECK (level IN ('WOODEN', 'BRONZE', 'SILVER', 'GOLD')); 
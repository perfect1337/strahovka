-- Drop existing token columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' 
               AND column_name = 'access_token') THEN
        ALTER TABLE users DROP COLUMN access_token;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' 
               AND column_name = 'refresh_token') THEN
        ALTER TABLE users DROP COLUMN refresh_token;
    END IF;
END $$;

-- Add token columns with consistent types
ALTER TABLE users
ADD COLUMN access_token TEXT,
ADD COLUMN refresh_token TEXT; 
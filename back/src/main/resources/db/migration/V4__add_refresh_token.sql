DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'refresh_token'
    ) THEN
        ALTER TABLE users ADD COLUMN refresh_token VARCHAR(255);
    END IF;
END $$; 
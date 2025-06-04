-- Add phone column to users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(255); 
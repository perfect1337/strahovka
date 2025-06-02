-- First, remove all constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;

-- Create a temporary table
CREATE TABLE users_temp AS 
SELECT * FROM users;

-- Drop the original table
DROP TABLE users;

-- Recreate the table with proper constraints
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    phone VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    level VARCHAR(50) NOT NULL DEFAULT 'WOODEN',
    policy_count INTEGER DEFAULT 0,
    refresh_token TEXT,
    access_token TEXT,
    CONSTRAINT users_role_check CHECK (role::text IN ('USER', 'ADMIN', 'MODERATOR')),
    CONSTRAINT users_level_check CHECK (level::text IN ('WOODEN', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'))
);

-- Copy data back
INSERT INTO users (
    id, email, first_name, last_name, middle_name, phone,
    password, role, level, policy_count, refresh_token, access_token
)
SELECT 
    id, email, first_name, last_name, middle_name, phone,
    password, 
    CASE 
        WHEN role NOT IN ('USER', 'ADMIN', 'MODERATOR') THEN 'USER'
        ELSE role 
    END,
    CASE 
        WHEN level NOT IN ('WOODEN', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM') THEN 'WOODEN'
        ELSE level 
    END,
    COALESCE(policy_count, 0),
    refresh_token,
    access_token
FROM users_temp;

-- Drop the temporary table
DROP TABLE users_temp;

-- Reset the sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users)); 
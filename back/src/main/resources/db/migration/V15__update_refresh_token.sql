-- Update users with null refresh tokens
UPDATE users 
SET refresh_token = md5(random()::text || clock_timestamp()::text)
WHERE refresh_token IS NULL; 
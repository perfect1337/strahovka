-- Add user_id column
ALTER TABLE insurance_packages
ADD COLUMN user_id BIGINT;

-- Add foreign key constraint
ALTER TABLE insurance_packages
ADD CONSTRAINT fk_insurance_package_user
FOREIGN KEY (user_id) REFERENCES users(id);

-- Get the first user's ID as a default value
DO $$
DECLARE
    default_user_id BIGINT;
BEGIN
    SELECT id INTO default_user_id FROM users LIMIT 1;
    
    -- Update existing records with the default user_id
    UPDATE insurance_packages
    SET user_id = default_user_id
    WHERE user_id IS NULL;
END $$;

-- Make user_id not nullable
ALTER TABLE insurance_packages
ALTER COLUMN user_id SET NOT NULL; 
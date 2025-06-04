-- Drop and recreate smoking_status column in health_applications
ALTER TABLE health_applications DROP COLUMN IF EXISTS smoking_status;
ALTER TABLE health_applications ADD COLUMN smoking_status BOOLEAN DEFAULT FALSE; 
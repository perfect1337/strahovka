-- Update status columns to use application_status type
ALTER TABLE kasko_applications 
    ALTER COLUMN status TYPE application_status USING status::application_status;

ALTER TABLE osago_applications 
    ALTER COLUMN status TYPE application_status USING status::application_status;

ALTER TABLE travel_applications 
    ALTER COLUMN status TYPE application_status USING status::application_status;

ALTER TABLE health_applications 
    ALTER COLUMN status TYPE application_status USING status::application_status;

ALTER TABLE property_applications 
    ALTER COLUMN status TYPE application_status USING status::application_status;

-- Set default values back
ALTER TABLE kasko_applications 
    ALTER COLUMN status SET DEFAULT 'PENDING'::application_status;

ALTER TABLE osago_applications 
    ALTER COLUMN status SET DEFAULT 'PENDING'::application_status;

ALTER TABLE travel_applications 
    ALTER COLUMN status SET DEFAULT 'PENDING'::application_status;

ALTER TABLE health_applications 
    ALTER COLUMN status SET DEFAULT 'PENDING'::application_status;

ALTER TABLE property_applications 
    ALTER COLUMN status SET DEFAULT 'PENDING'::application_status; 
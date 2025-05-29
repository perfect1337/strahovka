-- Drop existing constraints that use the enum
ALTER TABLE kasko_applications ALTER COLUMN status DROP DEFAULT;
ALTER TABLE osago_applications ALTER COLUMN status DROP DEFAULT;
ALTER TABLE travel_applications ALTER COLUMN status DROP DEFAULT;
ALTER TABLE health_applications ALTER COLUMN status DROP DEFAULT;
ALTER TABLE property_applications ALTER COLUMN status DROP DEFAULT;

-- Create the enum type if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM (
            'PENDING',
            'IN_REVIEW',
            'APPROVED',
            'REJECTED',
            'NEED_INFO',
            'CANCELLED',
            'PAID',
            'ACTIVE',
            'COMPLETED'
        );
    END IF;
END $$;

-- Add new values to the enum type
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'CANCELLED' AFTER 'NEED_INFO';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'PAID' AFTER 'CANCELLED';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'ACTIVE' AFTER 'PAID';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'COMPLETED' AFTER 'ACTIVE'; 
-- Rename application_date column to applicationDate in base_applications table
ALTER TABLE base_applications RENAME COLUMN application_date TO "applicationDate";

-- Ensure the column has the correct type and default value
ALTER TABLE base_applications ALTER COLUMN "applicationDate" TYPE TIMESTAMP USING "applicationDate"::TIMESTAMP;
ALTER TABLE base_applications ALTER COLUMN "applicationDate" SET DEFAULT CURRENT_TIMESTAMP; 
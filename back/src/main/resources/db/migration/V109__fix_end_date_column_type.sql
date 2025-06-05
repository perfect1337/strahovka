-- Fix endDate column type in base_applications table
ALTER TABLE base_applications ALTER COLUMN "endDate" TYPE DATE USING DATE("endDate"); 
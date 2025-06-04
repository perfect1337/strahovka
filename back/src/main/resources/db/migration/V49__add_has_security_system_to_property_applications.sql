-- Add has_security_system column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS has_security_system BOOLEAN; 
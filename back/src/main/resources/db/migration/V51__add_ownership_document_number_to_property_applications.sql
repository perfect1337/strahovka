-- Add ownership_document_number column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS ownership_document_number VARCHAR(255); 
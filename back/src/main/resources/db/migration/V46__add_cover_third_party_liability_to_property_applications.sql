-- Add cover_third_party_liability column to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS cover_third_party_liability BOOLEAN; 
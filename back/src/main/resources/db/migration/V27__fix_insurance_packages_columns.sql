-- Fix insurance_packages columns
ALTER TABLE insurance_packages
    ALTER COLUMN discount TYPE INTEGER USING (discount::INTEGER),
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE'; 
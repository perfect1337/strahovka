ALTER TABLE insurance_claims 
    ADD COLUMN calculated_amount DECIMAL(10,2),
    ALTER COLUMN amount DROP NOT NULL; 
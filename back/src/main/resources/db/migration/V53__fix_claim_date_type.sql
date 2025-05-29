ALTER TABLE insurance_claims 
ALTER COLUMN claim_date TYPE DATE USING claim_date::DATE; 
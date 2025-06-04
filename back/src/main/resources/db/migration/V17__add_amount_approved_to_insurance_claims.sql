-- Add amount_approved and amount_requested columns to insurance_claims
ALTER TABLE insurance_claims
    DROP COLUMN IF EXISTS amount_approved;
ALTER TABLE insurance_claims
    DROP COLUMN IF EXISTS amount_requested;
ALTER TABLE insurance_claims
    ADD COLUMN amount_approved DOUBLE PRECISION,
    ADD COLUMN amount_requested DOUBLE PRECISION; 
-- Consolidate amount columns in insurance_claims table
ALTER TABLE insurance_claims
    DROP COLUMN IF EXISTS amount,
    DROP COLUMN IF EXISTS calculated_amount,
    DROP COLUMN IF EXISTS estimated_damage_amount,
    DROP COLUMN IF EXISTS approved_amount,
    DROP COLUMN IF EXISTS amount_approved,
    DROP COLUMN IF EXISTS amount_requested;

ALTER TABLE insurance_claims
    ADD COLUMN amount_requested DOUBLE PRECISION,
    ADD COLUMN amount_approved DOUBLE PRECISION; 
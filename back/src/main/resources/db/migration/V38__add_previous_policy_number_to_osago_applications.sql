-- Add previous_policy_number column to osago_applications
ALTER TABLE osago_applications
    ADD COLUMN IF NOT EXISTS previous_policy_number VARCHAR(255); 
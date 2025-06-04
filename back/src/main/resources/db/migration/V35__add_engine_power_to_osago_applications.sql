-- Add engine_power column to osago_applications
ALTER TABLE osago_applications
    ADD COLUMN IF NOT EXISTS engine_power INTEGER; 
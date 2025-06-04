-- Add display_order column to insurance_guides
ALTER TABLE insurance_guides
    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0; 
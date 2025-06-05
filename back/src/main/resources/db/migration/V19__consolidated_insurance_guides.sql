-- Консолидированные изменения для insurance_guides

ALTER TABLE insurance_guides
    ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS calculation_rules TEXT,
    ADD COLUMN IF NOT EXISTS coverage_details TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS important_notes TEXT,
    ADD COLUMN IF NOT EXISTS required_documents TEXT; 
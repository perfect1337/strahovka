-- Add columns to health_applications
ALTER TABLE health_applications
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add columns to kasko_applications
ALTER TABLE kasko_applications
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add columns to osago_applications
ALTER TABLE osago_applications
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add columns to property_applications
ALTER TABLE property_applications
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add columns to travel_applications
ALTER TABLE travel_applications
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE; 
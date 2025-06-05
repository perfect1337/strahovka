-- Консолидация всех изменений статусов в одну миграцию

-- Удаление дублирующихся колонок статуса
ALTER TABLE kasko_applications DROP COLUMN IF EXISTS application_status;
ALTER TABLE osago_applications DROP COLUMN IF EXISTS application_status;
ALTER TABLE travel_applications DROP COLUMN IF EXISTS application_status;
ALTER TABLE health_applications DROP COLUMN IF EXISTS application_status;
ALTER TABLE property_applications DROP COLUMN IF EXISTS application_status;

-- Добавление колонок статуса
ALTER TABLE kasko_applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE osago_applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE travel_applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE health_applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE property_applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE insurance_policies ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE insurance_packages ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';

-- Обновление существующих значений
UPDATE kasko_applications SET status = 'PENDING' WHERE status IS NULL;
UPDATE osago_applications SET status = 'PENDING' WHERE status IS NULL;
UPDATE travel_applications SET status = 'PENDING' WHERE status IS NULL;
UPDATE health_applications SET status = 'PENDING' WHERE status IS NULL;
UPDATE property_applications SET status = 'PENDING' WHERE status IS NULL;
UPDATE insurance_policies SET status = 'PENDING' WHERE status IS NULL;
UPDATE insurance_claims SET status = 'PENDING' WHERE status IS NULL;
UPDATE insurance_packages SET status = 'PENDING' WHERE status IS NULL;

-- Добавление NOT NULL ограничений
ALTER TABLE kasko_applications ALTER COLUMN status SET NOT NULL;
ALTER TABLE osago_applications ALTER COLUMN status SET NOT NULL;
ALTER TABLE travel_applications ALTER COLUMN status SET NOT NULL;
ALTER TABLE health_applications ALTER COLUMN status SET NOT NULL;
ALTER TABLE property_applications ALTER COLUMN status SET NOT NULL;
ALTER TABLE insurance_policies ALTER COLUMN status SET NOT NULL;
ALTER TABLE insurance_claims ALTER COLUMN status SET NOT NULL;
ALTER TABLE insurance_packages ALTER COLUMN status SET NOT NULL; 
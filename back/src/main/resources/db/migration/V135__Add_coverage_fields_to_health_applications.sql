ALTER TABLE health_applications
ADD COLUMN coverage_type VARCHAR(255),
ADD COLUMN coverage_amount NUMERIC(10, 2); 
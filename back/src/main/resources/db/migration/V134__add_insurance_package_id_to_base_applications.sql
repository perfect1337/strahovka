ALTER TABLE base_applications
ADD COLUMN insurance_package_id BIGINT,
ADD CONSTRAINT fk_base_applications_insurance_package
    FOREIGN KEY (insurance_package_id)
    REFERENCES insurance_packages (id); 
-- Create package_categories join table
CREATE TABLE IF NOT EXISTS package_categories (
    package_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (package_id, category_id),
    FOREIGN KEY (package_id) REFERENCES insurance_packages(id),
    FOREIGN KEY (category_id) REFERENCES insurance_categories(id)
); 
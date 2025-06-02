-- Insert Insurance Categories
INSERT INTO insurance_categories (id, name, description, type, base_price) VALUES
(1, 'КАСКО', 'Добровольное страхование автомобиля', 'AUTO', 5000.00),
(2, 'ОСАГО', 'Обязательное страхование автогражданской ответственности', 'AUTO', 3000.00),
(3, 'Путешествия', 'Страхование для путешественников', 'TRAVEL', 2000.00),
(4, 'Здоровье', 'Добровольное медицинское страхование', 'HEALTH', 4000.00),
(5, 'Недвижимость', 'Страхование недвижимого имущества', 'PROPERTY', 3500.00);

-- Set sequence value after explicit inserts
SELECT setval('insurance_categories_id_seq', (SELECT MAX(id) FROM insurance_categories));

-- Create a test user for package ownership
INSERT INTO users (id, email, password, first_name, last_name, role, level) VALUES
(1, 'admin@strahovka.com', '$2a$10$hKDVYxLefVHV/vtuPhWD3OigtRyOykRLDdUAp80Z1crSoS1lFqaFS', 'Admin', 'User', 'ADMIN', 'PLATINUM')
ON CONFLICT (email) DO NOTHING;

-- Insert Insurance Packages
INSERT INTO insurance_packages (id, user_id, name, original_total_amount, discount_percentage, final_amount, package_type, status) VALUES
(1, 1, 'Базовый пакет', 10000.00, 0, 10000.00, 'CUSTOM', 'COMPLETED'),
(2, 1, 'Стандартный пакет', 15000.00, 5, 14250.00, 'CUSTOM', 'COMPLETED'),
(3, 1, 'Премиум пакет', 25000.00, 10, 22500.00, 'CUSTOM', 'COMPLETED');

-- Set sequence value after explicit inserts
SELECT setval('insurance_packages_id_seq', (SELECT MAX(id) FROM insurance_packages));

-- Link Categories to Packages with explicit relationships
INSERT INTO package_categories (package_id, category_id) VALUES
-- Basic package relationships
(1, 2), -- Базовый - ОСАГО
(1, 5), -- Базовый - Недвижимость

-- Standard package relationships
(2, 1), -- Стандарт - КАСКО
(2, 2), -- Стандарт - ОСАГО
(2, 4), -- Стандарт - Здоровье

-- Premium package relationships
(3, 1), -- Премиум - КАСКО
(3, 2), -- Премиум - ОСАГО
(3, 3), -- Премиум - Путешествия
(3, 4), -- Премиум - Здоровье
(3, 5); -- Премиум - Недвижимость 
-- Insert Insurance Categories
INSERT INTO insurance_categories (name, description, type, base_price) VALUES
('КАСКО', 'Добровольное страхование автомобиля', 'AUTO', 5000.00),
('ОСАГО', 'Обязательное страхование автогражданской ответственности', 'AUTO', 3000.00),
('Путешествия', 'Страхование для путешественников', 'TRAVEL', 2000.00),
('Здоровье', 'Добровольное медицинское страхование', 'HEALTH', 4000.00),
('Недвижимость', 'Страхование недвижимого имущества', 'PROPERTY', 3500.00);

-- Insert Insurance Packages
INSERT INTO insurance_packages (name, description, baseprice, discount, active) VALUES
('Базовый', 'Базовый пакет страхования', 10000.00, 0, true),
('Стандарт', 'Стандартный пакет страхования', 15000.00, 5, true),
('Премиум', 'Премиум пакет страхования', 25000.00, 10, true);

-- Link Categories to Packages
INSERT INTO package_categories (package_id, category_id)
SELECT p.id, c.id
FROM insurance_packages p
CROSS JOIN insurance_categories c
WHERE p.name = 'Премиум';

INSERT INTO package_categories (package_id, category_id)
SELECT p.id, c.id
FROM insurance_packages p
CROSS JOIN insurance_categories c
WHERE p.name IN ('Стандарт', 'Премиум')
AND c.name IN ('КАСКО', 'ОСАГО', 'Здоровье');

INSERT INTO package_categories (package_id, category_id)
SELECT p.id, c.id
FROM insurance_packages p
CROSS JOIN insurance_categories c
WHERE p.name = 'Базовый'
AND c.name IN ('ОСАГО', 'Недвижимость');
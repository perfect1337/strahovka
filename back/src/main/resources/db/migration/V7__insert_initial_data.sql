-- Insert Insurance Categories
INSERT INTO insurance_categories (name, description, type, base_price) 
SELECT 'КАСКО', 'Добровольное страхование автомобиля', 'AUTO', 5000.00
WHERE NOT EXISTS (SELECT 1 FROM insurance_categories WHERE name = 'КАСКО');

INSERT INTO insurance_categories (name, description, type, base_price) 
SELECT 'ОСАГО', 'Обязательное страхование автогражданской ответственности', 'AUTO', 3000.00
WHERE NOT EXISTS (SELECT 1 FROM insurance_categories WHERE name = 'ОСАГО');

INSERT INTO insurance_categories (name, description, type, base_price) 
SELECT 'Путешествия', 'Страхование для путешественников', 'TRAVEL', 2000.00
WHERE NOT EXISTS (SELECT 1 FROM insurance_categories WHERE name = 'Путешествия');

INSERT INTO insurance_categories (name, description, type, base_price) 
SELECT 'Здоровье', 'Добровольное медицинское страхование', 'HEALTH', 4000.00
WHERE NOT EXISTS (SELECT 1 FROM insurance_categories WHERE name = 'Здоровье');

INSERT INTO insurance_categories (name, description, type, base_price) 
SELECT 'Недвижимость', 'Страхование недвижимого имущества', 'PROPERTY', 3500.00
WHERE NOT EXISTS (SELECT 1 FROM insurance_categories WHERE name = 'Недвижимость');

-- Insert Insurance Packages
INSERT INTO insurance_packages (name, description, baseprice, discount, active) 
SELECT 'Базовый', 'Базовый пакет страхования', 10000.00, 0, true
WHERE NOT EXISTS (SELECT 1 FROM insurance_packages WHERE name = 'Базовый');

INSERT INTO insurance_packages (name, description, baseprice, discount, active) 
SELECT 'Стандарт', 'Стандартный пакет страхования', 15000.00, 5, true
WHERE NOT EXISTS (SELECT 1 FROM insurance_packages WHERE name = 'Стандарт');

INSERT INTO insurance_packages (name, description, baseprice, discount, active) 
SELECT 'Премиум', 'Премиум пакет страхования', 25000.00, 10, true
WHERE NOT EXISTS (SELECT 1 FROM insurance_packages WHERE name = 'Премиум');

-- Insert Insurance Guides
INSERT INTO insurance_guides (title, content, insurance_type) 
SELECT 'Руководство по КАСКО', 'Полное руководство по страхованию КАСКО...', 'AUTO'
WHERE NOT EXISTS (SELECT 1 FROM insurance_guides WHERE title = 'Руководство по КАСКО');

INSERT INTO insurance_guides (title, content, insurance_type) 
SELECT 'Руководство по ОСАГО', 'Полное руководство по страхованию ОСАГО...', 'AUTO'
WHERE NOT EXISTS (SELECT 1 FROM insurance_guides WHERE title = 'Руководство по ОСАГО');

INSERT INTO insurance_guides (title, content, insurance_type) 
SELECT 'Руководство по страхованию путешествий', 'Полное руководство по страхованию путешествий...', 'TRAVEL'
WHERE NOT EXISTS (SELECT 1 FROM insurance_guides WHERE title = 'Руководство по страхованию путешествий');

INSERT INTO insurance_guides (title, content, insurance_type) 
SELECT 'Руководство по медицинскому страхованию', 'Полное руководство по медицинскому страхованию...', 'HEALTH'
WHERE NOT EXISTS (SELECT 1 FROM insurance_guides WHERE title = 'Руководство по медицинскому страхованию');

INSERT INTO insurance_guides (title, content, insurance_type) 
SELECT 'Руководство по страхованию недвижимости', 'Полное руководство по страхованию недвижимости...', 'PROPERTY'
WHERE NOT EXISTS (SELECT 1 FROM insurance_guides WHERE title = 'Руководство по страхованию недвижимости');

-- Link packages with categories
INSERT INTO package_categories (package_id, category_id)
SELECT p.id, c.id
FROM insurance_packages p
CROSS JOIN insurance_categories c
WHERE p.name = 'Базовый' AND c.name IN ('ОСАГО', 'Путешествия')
AND NOT EXISTS (
    SELECT 1 FROM package_categories pc 
    WHERE pc.package_id = p.id AND pc.category_id = c.id
);

INSERT INTO package_categories (package_id, category_id)
SELECT p.id, c.id
FROM insurance_packages p
CROSS JOIN insurance_categories c
WHERE p.name = 'Стандарт' AND c.name IN ('КАСКО', 'ОСАГО', 'Путешествия', 'Здоровье')
AND NOT EXISTS (
    SELECT 1 FROM package_categories pc 
    WHERE pc.package_id = p.id AND pc.category_id = c.id
);

INSERT INTO package_categories (package_id, category_id)
SELECT p.id, c.id
FROM insurance_packages p
CROSS JOIN insurance_categories c
WHERE p.name = 'Премиум' AND c.name IN ('КАСКО', 'ОСАГО', 'Путешествия', 'Здоровье', 'Недвижимость')
AND NOT EXISTS (
    SELECT 1 FROM package_categories pc 
    WHERE pc.package_id = p.id AND pc.category_id = c.id
); 
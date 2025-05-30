-- Insert initial insurance categories
INSERT INTO insurance_categories (name, description, base_price, type)
VALUES 
    ('КАСКО', 'Добровольное страхование автомобиля', 5000.00, 'AUTO'),
    ('ОСАГО', 'Обязательное страхование автогражданской ответственности', 3000.00, 'AUTO'),
    ('Недвижимость', 'Страхование квартир, домов и других объектов недвижимости', 4000.00, 'PROPERTY'),
    ('Здоровье', 'Добровольное медицинское страхование', 6000.00, 'HEALTH'),
    ('Ипотечное страхование', 'Комплексное страхование для ипотечных заемщиков', 7000.00, 'MORTGAGE'),
    ('Путешествия', 'Страхование для путешественников', 2000.00, 'TRAVEL')
ON CONFLICT (name) DO NOTHING; 
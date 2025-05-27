-- Update existing categories with their corresponding types
UPDATE insurance_categories
SET type = name
WHERE name IN ('КАСКО', 'ОСАГО', 'Недвижимость', 'Здоровье', 'Ипотечное страхование', 'Путешествия'); 
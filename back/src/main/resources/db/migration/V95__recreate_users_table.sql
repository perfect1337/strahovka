-- Сохраняем существующие данные во временную таблицу
CREATE TABLE users_temp AS SELECT * FROM users;

-- Удаляем существующую таблицу
DROP TABLE users;

-- Создаем таблицу заново с правильными ограничениями
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    policy_count INTEGER DEFAULT 0,
    refresh_token TEXT,
    access_token TEXT,
    CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')),
    CONSTRAINT users_level_check CHECK (level IN ('WOODEN', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'))
);

-- Восстанавливаем данные
INSERT INTO users (
    id, email, first_name, last_name, middle_name, 
    password, role, level, policy_count, refresh_token, access_token
)
SELECT 
    id, email, first_name, last_name, middle_name,
    password, role, level, policy_count, refresh_token, access_token
FROM users_temp;

-- Удаляем временную таблицу
DROP TABLE users_temp;

-- Сбрасываем последовательность id
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users)); 
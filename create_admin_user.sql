-- Скрипт для создания администратора в базе данных

-- Пароль: admin123 (захешированный с bcrypt)
-- Обратите внимание: $2a$ - это идентификатор bcrypt алгоритма
INSERT INTO users (email, password, role, level, created_at, updated_at)
VALUES (
    'admin@example.com', 
    '$2a$10$5PuqGJGTgvgik9T9KWnI8ORB7PQvBGzqmBwJGTXLqAWkMvJl1bvYe', -- admin123 захешированный с bcrypt
    'ADMIN',
    'GOLD',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Если в вашей БД есть дополнительная таблица user_roles
-- INSERT INTO user_roles (user_id, role)
-- VALUES ((SELECT id FROM users WHERE email = 'admin@example.com'), 'ADMIN');

-- Пример как запустить скрипт:
-- MySQL: mysql -u username -p database_name < create_admin_user.sql
-- PostgreSQL: psql -U username -d database_name -f create_admin_user.sql
-- H2 Console: выполните SQL запрос через веб-консоль H2 
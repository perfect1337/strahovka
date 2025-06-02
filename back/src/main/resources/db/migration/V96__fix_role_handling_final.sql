-- Сначала удалим существующие ограничения
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Обновим все существующие роли, чтобы убедиться, что они соответствуют enum
UPDATE users SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN', 'MODERATOR');

-- Добавим новое ограничение
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role::text IN ('USER', 'ADMIN', 'MODERATOR')); 
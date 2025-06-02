-- Удаляем все существующие ограничения на роли
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;

-- Обновляем существующие роли (если они остались с префиксом)
UPDATE users SET role = 'USER' WHERE role = 'ROLE_USER';
UPDATE users SET role = 'ADMIN' WHERE role = 'ROLE_ADMIN';
UPDATE users SET role = 'MODERATOR' WHERE role = 'ROLE_MODERATOR';

-- Добавляем новое ограничение
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')); 
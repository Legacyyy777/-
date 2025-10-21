-- Создание read-only пользователя для MiniApp
-- Этот пользователь может только читать данные, но не изменять их
-- Запустите этот скрипт в PostgreSQL бота

-- Создаём пользователя (если не существует)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'miniapp_readonly') THEN
        CREATE USER miniapp_readonly WITH PASSWORD 'miniapp_readonly_password';
        RAISE NOTICE 'Пользователь miniapp_readonly создан';
    ELSE
        RAISE NOTICE 'Пользователь miniapp_readonly уже существует';
    END IF;
END
$$;

-- Даём доступ к базе данных
GRANT CONNECT ON DATABASE remnawave_bot TO miniapp_readonly;

-- Даём доступ к схеме public
GRANT USAGE ON SCHEMA public TO miniapp_readonly;

-- Даём права на чтение всех текущих таблиц
GRANT SELECT ON ALL TABLES IN SCHEMA public TO miniapp_readonly;

-- Даём права на чтение будущих таблиц (автоматически)
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT ON TABLES TO miniapp_readonly;

-- Даём доступ к sequences (для получения ID, если нужно)
GRANT SELECT, USAGE ON ALL SEQUENCES IN SCHEMA public TO miniapp_readonly;

-- Для будущих sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT, USAGE ON SEQUENCES TO miniapp_readonly;

-- Убеждаемся что нет прав на изменение данных
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM miniapp_readonly;

-- Показываем созданные права
SELECT 
    'miniapp_readonly' as username,
    'remnawave_bot' as database,
    'SELECT on all tables' as permissions,
    'Пользователь создан успешно' as status;

-- Инструкция по применению:
-- 
-- 1. Подключитесь к PostgreSQL бота:
--    docker exec -it remnawave_bot_db psql -U remnawave_user -d remnawave_bot
-- 
-- 2. Скопируйте и выполните этот SQL скрипт
-- 
-- 3. Проверьте что пользователь создан:
--    \du miniapp_readonly
-- 
-- 4. Проверьте права:
--    SELECT grantee, privilege_type 
--    FROM information_schema.role_table_grants 
--    WHERE grantee = 'miniapp_readonly' 
--    LIMIT 10;
-- 
-- 5. Обновите .env файл MiniApp backend:
--    POSTGRES_USER=miniapp_readonly
--    POSTGRES_PASSWORD=miniapp_readonly_password


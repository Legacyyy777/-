#!/bin/bash
# Скрипт настройки прямого доступа к БД для MiniApp

set -e

echo "🔧 Настройка доступа MiniApp к БД бота..."
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка что запущен PostgreSQL
if ! docker ps | grep -q remnawave_bot_db; then
    echo -e "${RED}❌ Контейнер PostgreSQL не запущен!${NC}"
    echo "Запустите сначала бота: docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL контейнер найден${NC}"
echo ""

# Запрос пароля для нового пользователя
read -sp "Введите пароль для пользователя miniapp_readonly (или Enter для автогенерации): " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
    echo -e "${YELLOW}Сгенерирован пароль: ${DB_PASSWORD}${NC}"
fi

echo ""
echo "📝 Создание read-only пользователя в PostgreSQL..."

# Создание пользователя через docker exec
docker exec -i remnawave_bot_db psql -U remnawave_user -d remnawave_bot << EOF
-- Создание пользователя
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'miniapp_readonly') THEN
        CREATE USER miniapp_readonly WITH PASSWORD '$DB_PASSWORD';
        RAISE NOTICE 'Пользователь miniapp_readonly создан';
    ELSE
        ALTER USER miniapp_readonly WITH PASSWORD '$DB_PASSWORD';
        RAISE NOTICE 'Пароль для miniapp_readonly обновлён';
    END IF;
END
\$\$;

-- Права на подключение
GRANT CONNECT ON DATABASE remnawave_bot TO miniapp_readonly;
GRANT USAGE ON SCHEMA public TO miniapp_readonly;

-- Права на чтение
GRANT SELECT ON ALL TABLES IN SCHEMA public TO miniapp_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO miniapp_readonly;
GRANT SELECT, USAGE ON ALL SEQUENCES IN SCHEMA public TO miniapp_readonly;

-- Убираем права на изменение
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM miniapp_readonly;

SELECT 'Пользователь настроен успешно!' as status;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Пользователь создан успешно${NC}"
else
    echo -e "${RED}❌ Ошибка создания пользователя${NC}"
    exit 1
fi

echo ""
echo "📝 Создание .env файла для backend..."

# Получаем данные из основного .env бота
if [ -f "../.env" ]; then
    source ../.env
elif [ -f ".env" ]; then
    source .env
fi

# Создаём .env для backend
cat > backend/.env << EOF
# База данных бота
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=remnawave_bot
POSTGRES_USER=miniapp_readonly
POSTGRES_PASSWORD=$DB_PASSWORD

# Порт API
PORT=3001

# CORS (разрешённые домены)
ALLOWED_ORIGINS=http://localhost:3000,https://testminiapp.legacyyy777.site

# Telegram Bot Token (для валидации initData)
BOT_TOKEN=${BOT_TOKEN:-your_bot_token_here}

# Режим
NODE_ENV=production
EOF

echo -e "${GREEN}✅ Файл backend/.env создан${NC}"
echo ""

echo "📝 Проверка подключения..."

# Тестовое подключение
docker run --rm --network bot_network postgres:15-alpine \
    psql "postgresql://miniapp_readonly:$DB_PASSWORD@postgres:5432/remnawave_bot" \
    -c "SELECT COUNT(*) as total_users FROM users;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Подключение работает!${NC}"
else
    echo -e "${YELLOW}⚠️  Не удалось проверить подключение (возможно таблица users не существует)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Настройка завершена!${NC}"
echo ""
echo "Следующие шаги:"
echo "1. Проверьте backend/.env"
echo "2. Адаптируйте SQL запросы под вашу схему БД в backend/src/routes/"
echo "3. Запустите backend: cd backend && npm install && npm run dev"
echo "4. Или запустите через Docker: docker-compose -f docker-compose.db-access.yml up -d"
echo ""
echo "Пароль БД сохранён в: backend/.env"
echo -e "${YELLOW}⚠️  Не коммитьте .env файл в git!${NC}"


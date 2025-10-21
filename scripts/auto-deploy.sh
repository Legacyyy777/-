#!/bin/bash
# Автоматический деплой MiniApp Backend
# Одна команда - всё работает!

set -e

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Автоматический деплой MiniApp Backend${NC}"
echo ""

# 1. Найти PostgreSQL контейнер бота
echo -e "${YELLOW}📦 Поиск PostgreSQL бота...${NC}"

# Сначала ищем remnawave_bot_db
PG_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "remnawave.*db|remnawave_bot_db" | head -1)

# Если не нашли - показываем список и просим выбрать
if [ -z "$PG_CONTAINER" ]; then
    echo -e "${YELLOW}⚠️  remnawave_bot_db не найден автоматически${NC}"
    echo ""
    echo "Найденные PostgreSQL контейнеры:"
    docker ps --filter name=postgres --filter name=db --format "  - {{.Names}}"
    echo ""
    read -p "Введите имя контейнера PostgreSQL для Bedolaga бота: " PG_CONTAINER
    
    if [ -z "$PG_CONTAINER" ]; then
        echo -e "${RED}❌ Контейнер не указан!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Найден: $PG_CONTAINER${NC}"

# 2. Определить сеть PostgreSQL
echo -e "${YELLOW}🔍 Определение сети...${NC}"
PG_NETWORK=$(docker inspect $PG_CONTAINER --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}')

if [ -z "$PG_NETWORK" ]; then
    echo -e "${RED}❌ Не удалось определить сеть${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Сеть: $PG_NETWORK${NC}"

# 3. Найти .env бота и получить BOT_TOKEN
echo -e "${YELLOW}🔑 Поиск BOT_TOKEN...${NC}"
BOT_TOKEN=""

# Возможные пути к .env бота
BOT_PATHS=(
    "/opt/mybot/.env"
    "/opt/bot/.env"
    "/root/bot/.env"
    "/root/remnawave-bedolaga-telegram-bot/.env"
    "/var/www/bot/.env"
    "/home/*/bot/.env"
)

for path in "${BOT_PATHS[@]}"; do
    if [ -f "$path" ]; then
        BOT_TOKEN=$(grep "^BOT_TOKEN=" "$path" | cut -d '=' -f2- | tr -d '"' | tr -d "'")
        if [ -n "$BOT_TOKEN" ]; then
            echo -e "${GREEN}✅ BOT_TOKEN найден в: $path${NC}"
            break
        fi
    fi
done

if [ -z "$BOT_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  BOT_TOKEN не найден автоматически${NC}"
    read -p "Введите BOT_TOKEN вручную: " BOT_TOKEN
    if [ -z "$BOT_TOKEN" ]; then
        echo -e "${RED}❌ BOT_TOKEN обязателен!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ BOT_TOKEN: ${BOT_TOKEN:0:10}...${NC}"

# 4. Создать/обновить backend/.env
echo -e "${YELLOW}📝 Создание backend/.env...${NC}"

# Получить пароль из существующего .env или сгенерировать новый
if [ -f "backend/.env" ]; then
    DB_PASSWORD=$(grep "^POSTGRES_PASSWORD=" backend/.env | cut -d '=' -f2-)
fi

if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
fi

# Создаём .env построчно для правильной подстановки переменных
echo "# База данных бота" > backend/.env
echo "POSTGRES_HOST=postgres" >> backend/.env
echo "POSTGRES_PORT=5432" >> backend/.env
echo "POSTGRES_DB=remnawave_bot" >> backend/.env
echo "POSTGRES_USER=miniapp_readonly" >> backend/.env
echo "POSTGRES_PASSWORD=${DB_PASSWORD}" >> backend/.env
echo "" >> backend/.env
echo "# Порт API" >> backend/.env
echo "PORT=3003" >> backend/.env
echo "" >> backend/.env
echo "# CORS" >> backend/.env
echo "ALLOWED_ORIGINS=http://localhost:3000,https://testminiapp.legacyyy777.site" >> backend/.env
echo "" >> backend/.env
echo "# Режим" >> backend/.env
echo "NODE_ENV=production" >> backend/.env
echo "" >> backend/.env
echo "# Telegram Bot Token" >> backend/.env
echo "BOT_TOKEN=${BOT_TOKEN}" >> backend/.env

echo -e "${GREEN}✅ backend/.env создан${NC}"
echo -e "${GREEN}   Пароль БД: ${DB_PASSWORD}${NC}"

# 5. Создать read-only пользователя в PostgreSQL (если не существует)
echo -e "${YELLOW}🔐 Настройка доступа к БД...${NC}"

docker exec -i $PG_CONTAINER psql -U remnawave_user -d remnawave_bot > /dev/null 2>&1 << EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'miniapp_readonly') THEN
        CREATE USER miniapp_readonly WITH PASSWORD '$DB_PASSWORD';
    ELSE
        ALTER USER miniapp_readonly WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;
GRANT CONNECT ON DATABASE remnawave_bot TO miniapp_readonly;
GRANT USAGE ON SCHEMA public TO miniapp_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO miniapp_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO miniapp_readonly;
GRANT SELECT, USAGE ON ALL SEQUENCES IN SCHEMA public TO miniapp_readonly;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM miniapp_readonly;
EOF

echo -e "${GREEN}✅ Доступ к БД настроен${NC}"

# 6. Создать docker-compose с правильной сетью
echo -e "${YELLOW}🐳 Создание docker-compose.yml...${NC}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

cat > backend/docker-compose.yml << EOF
version: '3.8'

services:
  miniapp-backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: remnawave_miniapp_backend
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "127.0.0.1:3003:3003"
    networks:
      - $PG_NETWORK
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3003/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  $PG_NETWORK:
    external: true
EOF

echo -e "${GREEN}✅ docker-compose.yml создан${NC}"

# 7. Запустить backend
echo -e "${YELLOW}🚀 Запуск backend...${NC}"
cd backend
docker compose down 2>/dev/null || true
docker compose up -d --build

echo ""
echo -e "${GREEN}✅ Backend запущен!${NC}"
echo ""
echo -e "${BLUE}📊 Проверка:${NC}"
echo "  Логи:        docker logs -f remnawave_miniapp_backend"
echo "  Health:      curl http://localhost:3003/health"
echo "  Остановить:  cd backend && docker compose down"
echo ""
echo -e "${YELLOW}📝 Порты:${NC}"
echo "  Frontend (miniapp): http://localhost:3001"
echo "  Backend (API):      http://localhost:3003"
echo ""

# Ждём запуска и показываем логи
sleep 3
echo -e "${BLUE}📋 Последние логи:${NC}"
docker logs --tail 20 remnawave_miniapp_backend

echo ""
echo -e "${GREEN}🎉 Деплой завершён!${NC}"


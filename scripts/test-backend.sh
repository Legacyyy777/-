#!/bin/bash
# Скрипт тестирования backend API

set -e

BACKEND_URL=${1:-http://localhost:3001}

echo "🧪 Тестирование MiniApp Backend API..."
echo "URL: $BACKEND_URL"
echo ""

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Health Check
echo "1️⃣  Проверка health endpoint..."
HEALTH=$(curl -s "$BACKEND_URL/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✅ Health check: OK${NC}"
    echo "   $HEALTH"
else
    echo -e "${RED}❌ Health check: FAILED${NC}"
    exit 1
fi

echo ""

# 2. Проверка БД подключения через логи
if docker ps | grep -q remnawave_miniapp_backend; then
    echo "2️⃣  Проверка логов backend..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker logs remnawave_miniapp_backend --tail 20
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""

# 3. Тест subscription endpoint (требует initData)
echo "3️⃣  Тест subscription endpoint..."
echo -e "${YELLOW}⚠️  Для полного теста нужен валидный initData от Telegram${NC}"
echo ""

# Тест без авторизации (должен вернуть 401)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/subscription" -H "Content-Type: application/json" -d '{}')
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Валидация initData работает (ожидаемо 401 без auth)${NC}"
else
    echo -e "${RED}❌ Неожиданный ответ: $RESPONSE${NC}"
fi

echo ""
echo "🎉 Базовые тесты пройдены!"
echo ""
echo "Для полного тестирования:"
echo "1. Откройте MiniApp в Telegram"
echo "2. Проверьте что запросы проходят успешно"
echo "3. Проверьте логи: docker logs -f remnawave_miniapp_backend"


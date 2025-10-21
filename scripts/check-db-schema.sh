#!/bin/bash
# Скрипт проверки схемы БД для адаптации запросов

echo "🔍 Проверка схемы базы данных бота..."
echo ""

if ! docker ps | grep -q remnawave_bot_db; then
    echo "❌ Контейнер PostgreSQL не запущен!"
    exit 1
fi

echo "📊 Список всех таблиц:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec -it remnawave_bot_db psql -U remnawave_user -d remnawave_bot -c "\dt"

echo ""
echo "📋 Структура таблицы users:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec -it remnawave_bot_db psql -U remnawave_user -d remnawave_bot -c "\d users"

echo ""
echo "📋 Структура таблицы subscriptions (если есть):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec -it remnawave_bot_db psql -U remnawave_user -d remnawave_bot -c "\d subscriptions" 2>/dev/null || echo "Таблица не найдена"

echo ""
echo "📋 Структура таблицы servers (если есть):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec -it remnawave_bot_db psql -U remnawave_user -d remnawave_bot -c "\d servers" 2>/dev/null || echo "Таблица не найдена"

echo ""
echo "📋 Структура таблицы user_devices (если есть):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec -it remnawave_bot_db psql -U remnawave_user -d remnawave_bot -c "\d user_devices" 2>/dev/null || echo "Таблица не найдена"

echo ""
echo "💡 Используйте эту информацию для адаптации SQL запросов в:"
echo "   - backend/src/routes/subscription.ts"
echo "   - backend/src/routes/balance.ts"
echo "   - backend/src/routes/referral.ts"


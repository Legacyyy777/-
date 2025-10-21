#!/bin/bash

# Скрипт для деплоя MiniApp Backend
# Использование: bash deploy.sh

set -e

echo "🚀 Деплой MiniApp Backend..."

# Переходим в директорию скрипта
cd "$(dirname "$0")"

# Проверяем что .env существует
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    echo "📝 Создайте .env файл с настройками подключения к БД"
    exit 1
fi

# Останавливаем старый контейнер
echo "⏹️  Останавливаем старый контейнер..."
docker compose down 2>/dev/null || true

# Собираем новый образ
echo "🔨 Собираем Docker образ..."
docker compose build --no-cache

# Запускаем контейнер
echo "▶️  Запускаем контейнер..."
docker compose up -d

# Ждём запуска
echo "⏳ Ждём запуска backend..."
sleep 5

# Проверяем статус
echo "✅ Проверяем статус..."
docker compose ps

# Показываем логи
echo ""
echo "📋 Последние логи:"
docker compose logs --tail 20

echo ""
echo "✅ Деплой завершён!"
echo "📊 Проверить работу: curl http://localhost:3003/health"


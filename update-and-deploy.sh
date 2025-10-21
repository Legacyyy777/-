#!/bin/bash

# Скрипт для быстрого обновления и деплоя
# Использование: bash update-and-deploy.sh [backend|frontend|all]

set -e

MODE=${1:-all}

echo "🔄 Обновление и деплой MiniApp"
echo ""

# Переходим в корень проекта
cd "$(dirname "$0")"

# 1. Git pull
echo "📥 Получаем обновления из Git..."
git pull
echo "✅ Git обновлён!"
echo ""

# 2. Запускаем деплой
bash deploy-all.sh $MODE


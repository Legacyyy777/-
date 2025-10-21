#!/bin/bash

# Универсальный скрипт деплоя MiniApp
# Использование: bash deploy-all.sh [backend|frontend|all]

set -e

MODE=${1:-all}

echo "🚀 Деплой MiniApp - режим: $MODE"
echo ""

# Переходим в корень проекта
cd "$(dirname "$0")"
ROOT_DIR=$(pwd)

# Функция деплоя backend
deploy_backend() {
    echo "📦 Деплой Backend..."
    cd "$ROOT_DIR/backend"
    bash deploy.sh
    echo "✅ Backend задеплоен!"
    echo ""
}

# Функция деплоя frontend
deploy_frontend() {
    echo "🎨 Деплой Frontend..."
    cd "$ROOT_DIR/docker"
    
    echo "⏹️  Останавливаем контейнер..."
    docker compose down
    
    echo "🔨 Пересборка и запуск..."
    docker compose up -d --build
    
    echo "⏳ Ждём запуска..."
    sleep 5
    
    echo "✅ Frontend задеплоен!"
    echo ""
}

# Основной процесс
case $MODE in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "❌ Неизвестный режим: $MODE"
        echo "Использование: bash deploy-all.sh [backend|frontend|all]"
        exit 1
        ;;
esac

# Показываем статус
echo "📊 Статус контейнеров:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|remnawave"

echo ""
echo "✅ Деплой завершён!"
echo ""
echo "🔗 Ссылки:"
echo "   MiniApp: https://testminiapp.legacyyy777.site"
echo "   Backend Health: http://localhost:3003/health"
echo ""
echo "📋 Логи:"
echo "   Backend:  docker logs remnawave_miniapp_backend --tail 20"
echo "   Frontend: docker logs remnawave-miniapp --tail 20"


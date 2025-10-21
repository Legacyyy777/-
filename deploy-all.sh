#!/bin/bash

# Универсальный скрипт деплоя MiniApp
# Использование: bash deploy-all.sh [backend|frontend|all]

set -e

MODE=${1:-all}

# Переходим в корень проекта
cd "$(dirname "$0")"
ROOT_DIR=$(pwd)

# Загружаем конфигурацию
CONFIG_FILE="$ROOT_DIR/.deploy.config"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Файл конфигурации не найден: $CONFIG_FILE"
    echo "📝 Создайте файл .deploy.config на основе .deploy.config.example"
    exit 1
fi

source "$CONFIG_FILE"

echo "🚀 Деплой MiniApp - режим: $MODE"
echo "📂 Проект: $ROOT_DIR"
echo ""

# Функция деплоя backend
deploy_backend() {
    echo "📦 Деплой Backend..."
    
    BACKEND_PATH="$ROOT_DIR/$BACKEND_DIR"
    if [ ! -d "$BACKEND_PATH" ]; then
        echo "❌ Директория backend не найдена: $BACKEND_PATH"
        exit 1
    fi
    
    cd "$BACKEND_PATH"
    
    if [ -f "deploy.sh" ]; then
        bash deploy.sh
    elif [ -f "$BACKEND_COMPOSE_FILE" ]; then
        docker compose -f "$BACKEND_COMPOSE_FILE" down
        docker compose -f "$BACKEND_COMPOSE_FILE" up -d --build
    else
        echo "❌ Не найден ни deploy.sh, ни $BACKEND_COMPOSE_FILE"
        exit 1
    fi
    
    echo "✅ Backend задеплоен!"
    echo ""
}

# Функция деплоя frontend
deploy_frontend() {
    echo "🎨 Деплой Frontend..."
    
    FRONTEND_PATH="$ROOT_DIR/$FRONTEND_DIR"
    if [ ! -d "$FRONTEND_PATH" ]; then
        echo "❌ Директория frontend не найдена: $FRONTEND_PATH"
        exit 1
    fi
    
    cd "$FRONTEND_PATH"
    
    if [ ! -f "$FRONTEND_COMPOSE_FILE" ]; then
        echo "❌ Docker Compose файл не найден: $FRONTEND_COMPOSE_FILE"
        exit 1
    fi
    
    echo "⏹️  Останавливаем контейнер..."
    docker compose -f "$FRONTEND_COMPOSE_FILE" down
    
    echo "🔨 Пересборка и запуск..."
    docker compose -f "$FRONTEND_COMPOSE_FILE" up -d --build
    
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
if [ -n "$DOCKER_NETWORK_PREFIX" ]; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|$DOCKER_NETWORK_PREFIX" || echo "Контейнеры не найдены"
else
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

echo ""
echo "✅ Деплой завершён!"
echo ""
echo "🔗 Ссылки:"
[ -n "$MINIAPP_URL" ] && echo "   MiniApp: $MINIAPP_URL"
[ -n "$BACKEND_HEALTH_URL" ] && echo "   Backend Health: $BACKEND_HEALTH_URL"
echo ""
echo "📋 Логи:"
[ -n "$BACKEND_CONTAINER_NAME" ] && echo "   Backend:  docker logs $BACKEND_CONTAINER_NAME --tail 20"
[ -n "$FRONTEND_CONTAINER_NAME" ] && echo "   Frontend: docker logs $FRONTEND_CONTAINER_NAME --tail 20"


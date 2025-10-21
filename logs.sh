#!/bin/bash

# Скрипт для просмотра логов
# Использование: bash logs.sh [backend|frontend|nginx|all]

# Переходим в корень проекта
cd "$(dirname "$0")"
ROOT_DIR=$(pwd)

# Загружаем конфигурацию
CONFIG_FILE="$ROOT_DIR/.deploy.config"
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

SERVICE=${1:-all}

# Устанавливаем значения по умолчанию если не заданы
BACKEND_CONTAINER=${BACKEND_CONTAINER_NAME:-"miniapp_backend"}
FRONTEND_CONTAINER=${FRONTEND_CONTAINER_NAME:-"miniapp_frontend"}
NGINX_CONTAINER=${NGINX_CONTAINER_NAME:-"nginx"}

case $SERVICE in
    backend)
        echo "📋 Логи Backend ($BACKEND_CONTAINER) - последние 50 строк:"
        docker logs $BACKEND_CONTAINER --tail 50 -f
        ;;
    frontend)
        echo "📋 Логи Frontend ($FRONTEND_CONTAINER) - последние 50 строк:"
        docker logs $FRONTEND_CONTAINER --tail 50 -f
        ;;
    nginx)
        echo "📋 Логи Nginx ($NGINX_CONTAINER) - последние 50 строк:"
        docker logs $NGINX_CONTAINER --tail 50 -f
        ;;
    all)
        echo "📋 Логи всех сервисов (последние 20 строк каждого):"
        echo ""
        echo "=== BACKEND ($BACKEND_CONTAINER) ==="
        docker logs $BACKEND_CONTAINER --tail 20 2>/dev/null || echo "Контейнер не найден"
        echo ""
        echo "=== FRONTEND ($FRONTEND_CONTAINER) ==="
        docker logs $FRONTEND_CONTAINER --tail 20 2>/dev/null || echo "Контейнер не найден"
        echo ""
        echo "=== NGINX ($NGINX_CONTAINER) ==="
        docker logs $NGINX_CONTAINER --tail 20 2>/dev/null || echo "Контейнер не найден"
        ;;
    *)
        echo "❌ Неизвестный сервис: $SERVICE"
        echo "Использование: bash logs.sh [backend|frontend|nginx|all]"
        exit 1
        ;;
esac


#!/bin/bash

# Скрипт для просмотра логов
# Использование: bash logs.sh [backend|frontend|nginx|all]

SERVICE=${1:-all}

case $SERVICE in
    backend)
        echo "📋 Логи Backend (последние 50 строк):"
        docker logs remnawave_miniapp_backend --tail 50 -f
        ;;
    frontend)
        echo "📋 Логи Frontend (последние 50 строк):"
        docker logs remnawave-miniapp --tail 50 -f
        ;;
    nginx)
        echo "📋 Логи Nginx (последние 50 строк):"
        docker logs remnawave-nginx --tail 50 -f
        ;;
    all)
        echo "📋 Логи всех сервисов (последние 20 строк каждого):"
        echo ""
        echo "=== BACKEND ==="
        docker logs remnawave_miniapp_backend --tail 20
        echo ""
        echo "=== FRONTEND ==="
        docker logs remnawave-miniapp --tail 20
        echo ""
        echo "=== NGINX ==="
        docker logs remnawave-nginx --tail 20
        ;;
    *)
        echo "❌ Неизвестный сервис: $SERVICE"
        echo "Использование: bash logs.sh [backend|frontend|nginx|all]"
        exit 1
        ;;
esac


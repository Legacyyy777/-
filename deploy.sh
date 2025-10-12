#!/bin/bash

# Скрипт для автоматического развертывания мини-апп на VPS
# 
# Использование:
#   ./deploy.sh build    - собрать образ локально
#   ./deploy.sh push     - загрузить образ на VPS
#   ./deploy.sh deploy   - развернуть на VPS
#   ./deploy.sh all      - выполнить все шаги

set -e  # Выход при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Конфигурация (отредактируйте под себя)
VPS_HOST="user@your-vps-ip"
VPS_PATH="/opt/remnawave"
IMAGE_NAME="remnawave-miniapp"
IMAGE_TAG="latest"

echo -e "${GREEN}🚀 Развертывание Telegram Mini App${NC}"

# Функция для сборки образа
build() {
    echo -e "${YELLOW}📦 Сборка Docker образа...${NC}"
    
    # Проверка .env
    if [ ! -f .env ]; then
        echo -e "${RED}❌ Файл .env не найден! Создайте из .env.example${NC}"
        exit 1
    fi
    
    # Сборка
    docker build -f docker/Dockerfile -t ${IMAGE_NAME}:${IMAGE_TAG} .
    
    echo -e "${GREEN}✅ Образ собран успешно${NC}"
}

# Функция для загрузки на VPS
push() {
    echo -e "${YELLOW}📤 Загрузка образа на VPS...${NC}"
    
    # Сохраняем образ в файл
    docker save ${IMAGE_NAME}:${IMAGE_TAG} | gzip > /tmp/miniapp-image.tar.gz
    
    # Загружаем на VPS
    scp /tmp/miniapp-image.tar.gz ${VPS_HOST}:/tmp/
    
    # Удаляем локальный файл
    rm /tmp/miniapp-image.tar.gz
    
    echo -e "${GREEN}✅ Образ загружен на VPS${NC}"
}

# Функция для развертывания на VPS
deploy() {
    echo -e "${YELLOW}🚀 Развертывание на VPS...${NC}"
    
    ssh ${VPS_HOST} << 'ENDSSH'
        # Загрузка образа
        echo "📥 Загрузка образа в Docker..."
        docker load < /tmp/miniapp-image.tar.gz
        rm /tmp/miniapp-image.tar.gz
        
        # Проверка сети
        echo "🔍 Проверка Docker сети..."
        if ! docker network ls | grep -q "remnawave-network"; then
            echo "⚠️  Сеть remnawave-network не найдена, создаём..."
            docker network create remnawave-network
        fi
        
        # Остановка старого контейнера
        echo "🛑 Остановка старого контейнера..."
        docker stop remnawave-miniapp 2>/dev/null || true
        docker rm remnawave-miniapp 2>/dev/null || true
        
        # Запуск нового контейнера
        echo "▶️  Запуск контейнера..."
        docker run -d \
            --name remnawave-miniapp \
            --network remnawave-network \
            -p 127.0.0.1:3000:3000 \
            --restart unless-stopped \
            remnawave-miniapp:latest
        
        # Проверка
        echo "✅ Проверка статуса..."
        sleep 3
        docker ps | grep miniapp
        
        echo "✅ Развертывание завершено!"
ENDSSH
    
    echo -e "${GREEN}✅ Мини-апп успешно развернут!${NC}"
    echo -e "${YELLOW}📝 Не забудьте настроить Nginx конфигурацию${NC}"
}

# Главная логика
case "$1" in
    build)
        build
        ;;
    push)
        push
        ;;
    deploy)
        deploy
        ;;
    all)
        build
        push
        deploy
        ;;
    *)
        echo "Использование: $0 {build|push|deploy|all}"
        echo ""
        echo "  build   - Собрать Docker образ локально"
        echo "  push    - Загрузить образ на VPS"
        echo "  deploy  - Развернуть на VPS"
        echo "  all     - Выполнить все шаги"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Готово!${NC}"


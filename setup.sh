#!/bin/bash

# Скрипт первоначальной настройки деплоя
# Создаёт конфигурационный файл .deploy.config

set -e

echo "🔧 Настройка деплоя MiniApp"
echo ""

# Переходим в корень проекта
cd "$(dirname "$0")"
ROOT_DIR=$(pwd)

CONFIG_FILE="$ROOT_DIR/.deploy.config"
EXAMPLE_FILE="$ROOT_DIR/.deploy.config.example"

# Проверяем существует ли уже конфиг
if [ -f "$CONFIG_FILE" ]; then
    echo "⚠️  Файл .deploy.config уже существует"
    read -p "Перезаписать? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Отменено"
        exit 0
    fi
fi

# Копируем пример
if [ -f "$EXAMPLE_FILE" ]; then
    cp "$EXAMPLE_FILE" "$CONFIG_FILE"
    echo "✅ Создан файл $CONFIG_FILE"
else
    echo "❌ Файл $EXAMPLE_FILE не найден"
    exit 1
fi

echo ""
echo "📝 Настройка параметров..."
echo ""

# Функция для запроса значения
ask_value() {
    local var_name=$1
    local description=$2
    local default_value=$3
    
    read -p "$description [$default_value]: " value
    value=${value:-$default_value}
    
    # Обновляем значение в конфиге
    sed -i "s|^$var_name=.*|$var_name=\"$value\"|" "$CONFIG_FILE"
}

# Запрашиваем основные параметры
echo "== Названия контейнеров =="
ask_value "BACKEND_CONTAINER_NAME" "Название backend контейнера" "miniapp_backend"
ask_value "FRONTEND_CONTAINER_NAME" "Название frontend контейнера" "miniapp_frontend"
ask_value "NGINX_CONTAINER_NAME" "Название nginx контейнера" "nginx"

echo ""
echo "== Структура проекта =="
ask_value "BACKEND_DIR" "Директория backend" "backend"
ask_value "FRONTEND_DIR" "Директория frontend" "docker"

echo ""
echo "== URL сервисов =="
ask_value "MINIAPP_URL" "URL MiniApp" "https://example.com"
ask_value "BACKEND_HEALTH_URL" "URL Backend Health" "http://localhost:3003/health"

echo ""
echo "== Режим разработки =="
ask_value "DEV_MODE_ENABLED" "Включить DEV режим? (true/false)" "true"
ask_value "DEV_USER_ID" "Telegram ID для тестов" "123456789"

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📄 Конфигурация сохранена в: $CONFIG_FILE"
echo ""
echo "🚀 Запустите деплой:"
echo "   bash update-and-deploy.sh"
echo ""
echo "📋 Просмотр логов:"
echo "   bash logs.sh"


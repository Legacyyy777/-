# 🚀 Инструкции по деплою MiniApp

## Первоначальная настройка

### 1. Создайте конфигурацию
```bash
# Автоматическая настройка (интерактивно)
bash setup.sh

# ИЛИ вручную
cp .deploy.config.example .deploy.config
nano .deploy.config  # Отредактируйте параметры
```

### 2. Настройте параметры в `.deploy.config`:
- `BACKEND_CONTAINER_NAME` - название backend контейнера
- `FRONTEND_CONTAINER_NAME` - название frontend контейнера
- `BACKEND_DIR` - путь к директории backend
- `FRONTEND_DIR` - путь к директории frontend
- `MINIAPP_URL` - URL вашего MiniApp
- И другие...

## Быстрый старт

### Полный деплой (Backend + Frontend)
```bash
bash update-and-deploy.sh
```

### Деплой только Backend
```bash
bash update-and-deploy.sh backend
```

### Деплой только Frontend
```bash
bash update-and-deploy.sh frontend
```

## Доступные скрипты

### 📥 `update-and-deploy.sh` - Обновление и деплой
Получает изменения из Git и деплоит проект

```bash
# Полный деплой
bash update-and-deploy.sh

# Только backend
bash update-and-deploy.sh backend

# Только frontend
bash update-and-deploy.sh frontend
```

### 📦 `deploy-all.sh` - Деплой без обновления
Деплоит проект без git pull

```bash
# Полный деплой
bash deploy-all.sh

# Только backend
bash deploy-all.sh backend

# Только frontend
bash deploy-all.sh frontend
```

### 📋 `logs.sh` - Просмотр логов
```bash
# Все логи
bash logs.sh

# Логи backend (в режиме follow)
bash logs.sh backend

# Логи frontend
bash logs.sh frontend

# Логи nginx
bash logs.sh nginx
```

## Ручной деплой

### Backend
```bash
cd /root/-/backend
bash deploy.sh
```

### Frontend
```bash
cd /root/-/docker
docker compose down
docker compose up -d --build
```

## Проверка статуса

### Список контейнеров
```bash
docker ps | grep remnawave
```

### Health check
```bash
curl http://localhost:3003/health
```

### Тест API
```bash
curl -X POST http://localhost:3003/miniapp/subscription \
  -H "Content-Type: application/json" \
  -d '{"initData":"user=%7B%22id%22%3A402695709%7D"}'
```

## Режим разработки

### Включить DEV режим (работа без Telegram)
```bash
echo "SKIP_AUTH=true" >> /root/-/backend/.env
docker restart remnawave_miniapp_backend
```

### Выключить DEV режим
```bash
sed -i '/SKIP_AUTH=true/d' /root/-/backend/.env
docker restart remnawave_miniapp_backend
```

## Полезные команды

### Перезапуск сервисов
```bash
# Backend
docker restart remnawave_miniapp_backend

# Frontend
docker restart remnawave-miniapp

# Nginx
docker restart remnawave-nginx
```

### Очистка Docker
```bash
# Удалить неиспользуемые образы
docker image prune -a

# Очистить кеш сборки
docker builder prune -af
```

## Ссылки

- **MiniApp:** https://testminiapp.legacyyy777.site
- **Panel:** https://testpanel.legacyyy777.site
- **Backend Health:** http://localhost:3003/health

## Структура проекта

```
/root/-/
├── backend/              # Backend API
│   ├── deploy.sh        # Скрипт деплоя backend
│   ├── docker-compose.yml
│   └── src/
├── docker/              # Frontend MiniApp
│   └── docker-compose.yml
├── deploy-all.sh        # Полный деплой
├── update-and-deploy.sh # Git pull + деплой
└── logs.sh              # Просмотр логов
```

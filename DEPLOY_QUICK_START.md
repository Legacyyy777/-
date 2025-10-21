# ⚡ Быстрый старт деплоя

## Первый раз на новом сервере

```bash
# 1. Клонируйте проект
git clone <your-repo-url>
cd <project-dir>

# 2. Настройте конфигурацию
bash setup.sh

# 3. Деплой!
bash update-and-deploy.sh
```

## Повседневное использование

```bash
# Обновить и задеплоить всё
bash update-and-deploy.sh

# Только backend
bash update-and-deploy.sh backend

# Только frontend
bash update-and-deploy.sh frontend

# Просмотр логов
bash logs.sh
bash logs.sh backend
bash logs.sh frontend
```

## Структура скриптов

| Скрипт | Описание |
|--------|----------|
| `setup.sh` | Первоначальная настройка (создаёт `.deploy.config`) |
| `update-and-deploy.sh` | Git pull + деплой |
| `deploy-all.sh` | Деплой без git pull |
| `logs.sh` | Просмотр логов контейнеров |

## Конфигурация

Все настройки в файле `.deploy.config`:

```bash
# Названия контейнеров
BACKEND_CONTAINER_NAME="miniapp_backend"
FRONTEND_CONTAINER_NAME="miniapp_frontend"

# Пути
BACKEND_DIR="backend"
FRONTEND_DIR="docker"

# URL
MINIAPP_URL="https://example.com"
```

Подробнее см. [DEPLOY.md](./DEPLOY.md)


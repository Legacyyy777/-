# Быстрый старт: Прямой доступ к БД бота

## Что это?

MiniApp теперь читает данные **напрямую из PostgreSQL** бота через легкий Node.js backend.

```
Frontend → Backend (Node.js) → PostgreSQL (read-only) ← Бот
```

**Преимущества:**
- ⚡ Быстрее - нет лишних HTTP запросов через бота
- 📉 Меньше нагрузки на бота
- 🔒 Безопасно - read-only доступ
- 🤖 **Автоматическая адаптация** - сам определяет схему БД

## Деплой на VPS (3 команды!)

### 1. Клонируйте или обновите код

```bash
# В папке с проектами на VPS
cd /var/www  # или где у вас проекты

# Если уже клонировали:
cd miniapp
git pull origin main

# Если первый раз:
git clone https://github.com/ваш-username/miniapp.git
cd miniapp
```

### 2. Создайте read-only пользователя в БД

```bash
# Автоматически (одна команда!)
bash scripts/setup-db-access.sh
```

Скрипт:
- ✅ Создаст пользователя `miniapp_readonly` в PostgreSQL бота
- ✅ Сгенерирует пароль
- ✅ Создаст `backend/.env` со всеми настройками
- ✅ Проверит подключение

### 3. Запустите backend

```bash
cd /путь/к/bedolaga-bot

# Добавьте backend в docker-compose (см. ниже)
# Затем:
docker-compose up -d --build
```

**Готово!** Backend автоматически определит схему БД бота и адаптируется под неё.

### 4. Установите зависимости

```bash
cd backend
npm install
```

### 5. Запустите

#### Локально (для разработки):

```bash
cd backend
npm run dev
```

#### В Docker (production):

Добавьте в ваш `docker-compose.yml` бота:

```yaml
services:
  # ... postgres, redis, bot

  miniapp-backend:
    build:
      context: ./путь/к/miniapp/backend
    container_name: remnawave_miniapp_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_DB: remnawave_bot
      POSTGRES_USER: miniapp_readonly
      POSTGRES_PASSWORD: ${MINIAPP_DB_PASSWORD}
      PORT: 3001
      BOT_TOKEN: ${BOT_TOKEN}
      NODE_ENV: production
    ports:
      - "127.0.0.1:3001:3001"
    networks:
      - bot_network
```

Или используйте готовый файл:

```bash
cd папка_с_ботом
docker-compose -f docker-compose.yml -f docker/docker-compose.db-access.yml up -d
```

### 6. Обновите frontend

В `src/api/client.ts` измените URL:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
```

Или в `.env`:
```bash
VITE_API_BASE_URL=http://miniapp-backend:3001
```

### 7. Проверьте работу

```bash
# Проверка health
curl http://localhost:3001/health

# Проверка логов
docker logs -f remnawave_miniapp_backend

# Автоматический тест
bash scripts/test-backend.sh
```

## Структура файлов

```
├── backend/                      # Backend с доступом к БД
│   ├── src/
│   │   ├── index.ts             # Главный файл
│   │   ├── db.ts                # PostgreSQL подключение
│   │   ├── middleware/
│   │   │   ├── auth.ts          # Проверка Telegram initData
│   │   │   └── errorHandler.ts
│   │   └── routes/
│   │       ├── subscription.ts   # ⚠️ АДАПТИРОВАТЬ ПОД ВАШУ БД
│   │       ├── balance.ts        # ⚠️ АДАПТИРОВАТЬ ПОД ВАШУ БД
│   │       └── referral.ts       # ⚠️ АДАПТИРОВАТЬ ПОД ВАШУ БД
│   ├── .env                     # Создаётся скриптом
│   ├── package.json
│   └── Dockerfile
│
├── scripts/
│   ├── setup-db-access.sh       # Автоматическая настройка
│   ├── check-db-schema.sh       # Проверка схемы БД
│   └── test-backend.sh          # Тестирование API
│
├── setup-db-readonly-user.sql   # SQL скрипт (если вручную)
└── DB_INTEGRATION_GUIDE.md      # Полная документация
```

## Безопасность

✅ **Пользователь БД** имеет только SELECT права (read-only)
✅ **Проверка initData** - каждый запрос валидируется через Telegram
✅ **Сетевая изоляция** - backend доступен только внутри Docker сети

## Что дальше?

1. ✅ Создали read-only пользователя
2. ✅ Проверили схему БД
3. ⚠️ **ВАЖНО:** Адаптируйте SQL запросы в `backend/src/routes/`
4. ✅ Запустили backend
5. ✅ Обновили frontend
6. ✅ Протестировали

## Проблемы?

**Ошибка подключения к БД:**
```bash
docker logs remnawave_miniapp_backend
# Проверьте POSTGRES_* переменные в backend/.env
```

**Ошибка "relation does not exist":**
```bash
# Проверьте названия таблиц
bash scripts/check-db-schema.sh
# Обновите запросы в backend/src/routes/
```

**401 Unauthorized:**
```bash
# Проверьте BOT_TOKEN в backend/.env
# Он должен совпадать с токеном вашего бота
```

## Полная документация

Смотрите `DB_INTEGRATION_GUIDE.md` для детальной информации.


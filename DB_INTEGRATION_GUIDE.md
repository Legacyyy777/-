# Прямой доступ MiniApp к базе данных бота

## Архитектура

```
┌─────────────┐
│  Frontend   │
│  (React)    │
│   :3000     │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│  Backend    │
│  (Node.js)  │
│   :3001     │
└──────┬──────┘
       │ SQL (READ-ONLY)
       ▼
┌─────────────┐         ┌──────────┐
│ PostgreSQL  │ ◄─────► │   Бот    │
│   :5432     │  R/W    │  :8080   │
└─────────────┘         └──────────┘
```

**Преимущества:**
- ⚡ **Быстрее** - нет посредников, прямые SQL запросы
- 📉 **Меньше нагрузки** - не нужно HTTP API в боте для каждого запроса
- 🔒 **Безопаснее** - read-only пользователь не может изменить данные
- 🎯 **Проще** - меньше кода, меньше точек отказа

## Установка

### Шаг 1: Создание read-only пользователя в PostgreSQL

Подключитесь к базе данных бота:

```bash
docker exec -it remnawave_bot_db psql -U remnawave_user -d remnawave_bot
```

Выполните SQL скрипт:

```sql
-- Создание пользователя
CREATE USER miniapp_readonly WITH PASSWORD 'your_secure_password_here';

-- Права на подключение
GRANT CONNECT ON DATABASE remnawave_bot TO miniapp_readonly;
GRANT USAGE ON SCHEMA public TO miniapp_readonly;

-- Права на чтение
GRANT SELECT ON ALL TABLES IN SCHEMA public TO miniapp_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT ON TABLES TO miniapp_readonly;

-- Проверка
\du miniapp_readonly
```

Или используйте готовый скрипт:

```bash
docker exec -i remnawave_bot_db psql -U remnawave_user -d remnawave_bot < setup-db-readonly-user.sql
```

### Шаг 2: Настройка Backend

Создайте `.env` файл в папке `backend/`:

```bash
# Backend/.env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=remnawave_bot
POSTGRES_USER=miniapp_readonly
POSTGRES_PASSWORD=your_secure_password_here

PORT=3001
NODE_ENV=production
BOT_TOKEN=your_bot_token_here
ALLOWED_ORIGINS=https://testminiapp.legacyyy777.site
```

### Шаг 3: Установка зависимостей

```bash
cd backend
npm install
```

### Шаг 4: Адаптация под вашу схему БД

**ВАЖНО:** Запросы в `backend/src/routes/` используют примерную схему БД. 
Адаптируйте их под вашу реальную схему!

Посмотрите структуру ваших таблиц:

```sql
-- В PostgreSQL
\dt              -- Список таблиц
\d users         -- Структура таблицы users
\d subscriptions -- Структура таблицы subscriptions
```

Отредактируйте файлы:
- `backend/src/routes/subscription.ts`
- `backend/src/routes/balance.ts`
- `backend/src/routes/referral.ts`

Замените названия колонок и таблиц на ваши.

### Шаг 5: Запуск

#### Локальная разработка:

```bash
cd backend
npm run dev
```

#### Production (Docker):

Добавьте в ваш основной `docker-compose.yml` бота:

```yaml
services:
  # ... существующие сервисы (postgres, redis, bot)

  miniapp-backend:
    build:
      context: ./miniapp/backend
      dockerfile: Dockerfile
    container_name: remnawave_miniapp_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_DB: ${POSTGRES_DB:-remnawave_bot}
      POSTGRES_USER: miniapp_readonly
      POSTGRES_PASSWORD: ${MINIAPP_DB_PASSWORD}
      PORT: 3001
      NODE_ENV: production
      BOT_TOKEN: ${BOT_TOKEN}
      ALLOWED_ORIGINS: "https://testminiapp.legacyyy777.site"
    ports:
      - "127.0.0.1:3001:3001"
    networks:
      - bot_network
```

Или используйте отдельный compose файл:

```bash
# В папке с ботом
docker-compose -f docker-compose.yml -f docker-compose.db-access.yml up -d
```

### Шаг 6: Обновление Frontend

Обновите API endpoint в `src/api/client.ts`:

```typescript
// Для production
const API_BASE_URL = window.location.protocol === 'https:'
    ? 'https://your-backend-url.com'  // URL вашего backend
    : 'http://localhost:3001';

// Для Docker
const API_BASE_URL = 'http://miniapp-backend:3001';
```

Или через переменные окружения:

```bash
# .env
VITE_API_BASE_URL=http://miniapp-backend:3001
```

## Структура проекта

```
├── backend/                    # Backend с доступом к БД
│   ├── src/
│   │   ├── index.ts           # Главный файл
│   │   ├── db.ts              # Подключение к PostgreSQL
│   │   ├── middleware/
│   │   │   ├── auth.ts        # Валидация Telegram initData
│   │   │   └── errorHandler.ts
│   │   └── routes/
│   │       ├── subscription.ts  # Эндпоинты подписки
│   │       ├── balance.ts       # Эндпоинты баланса
│   │       └── referral.ts      # Эндпоинты рефералов
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── setup-db-readonly-user.sql  # SQL скрипт создания пользователя
└── DB_INTEGRATION_GUIDE.md     # Эта инструкция
```

## Безопасность

### 1. Read-Only доступ

Пользователь `miniapp_readonly` имеет **только** права на чтение:

```sql
-- ✅ Разрешено
SELECT * FROM users WHERE telegram_id = 123;

-- ❌ Запрещено
UPDATE users SET balance = 1000000;
INSERT INTO users ...;
DELETE FROM users ...;
```

### 2. Валидация Telegram initData

Каждый запрос проверяется middleware `validateInitData`:

```typescript
// Проверяет:
// - Подпись от Telegram (HMAC SHA256)
// - Срок действия (не старше 24 часов)
// - Валидность данных пользователя
```

### 3. Сетевая изоляция

Backend доступен только:
- Внутри Docker сети `bot_network`
- Локально на `127.0.0.1:3001`

Не открывайте порт наружу без reverse proxy!

### 4. Environment переменные

Никогда не коммитьте `.env` файлы:

```bash
# .gitignore
.env
.env.local
.env.production
```

## API Endpoints

### Подписка

```http
POST /api/subscription
Content-Type: application/json

{
  "initData": "query_id=..."
}

Response:
{
  "success": true,
  "user": {
    "telegram_id": 123456789,
    "has_active_subscription": true,
    "subscription_status": "active",
    "subscribed_until": "2025-11-21T00:00:00Z",
    "traffic_limit_gb": 100,
    "traffic_used_gb": 25.5,
    "device_limit": 3,
    "balance_kopeks": 50000,
    "servers": [...],
    "devices": [...]
  }
}
```

### Баланс

```http
POST /api/balance

Response:
{
  "success": true,
  "balance_kopeks": 50000,
  "balance_rubles": 500
}
```

### Рефералы

```http
POST /api/referral

Response:
{
  "success": true,
  "referral_code": "ABC123",
  "total_referrals": 10,
  "active_referrals": 7,
  "total_earned_rubles": 1250,
  "referrals": [...]
}
```

## Адаптация под вашу схему БД

### Пример: Таблица users

Если ваша таблица выглядит так:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tg_id BIGINT UNIQUE NOT NULL,        -- вместо telegram_id
    balance INTEGER DEFAULT 0,            -- вместо balance_kopeks
    ref_code VARCHAR(10),                 -- вместо referral_code
    sub_active BOOLEAN DEFAULT false,     -- вместо has_active_subscription
    sub_expires_at TIMESTAMP,             -- вместо subscribed_until
    ...
);
```

Обновите запросы:

```typescript
// backend/src/routes/subscription.ts
const userResult = await query(`
    SELECT 
        tg_id as telegram_id,
        balance as balance_kopeks,
        ref_code as referral_code,
        sub_active as has_active_subscription,
        sub_expires_at as subscribed_until,
        traffic_limit,
        traffic_used,
        device_limit
    FROM users
    WHERE tg_id = $1
`, [userId]);
```

## Мониторинг

### Проверка подключения к БД

```bash
# Логи backend
docker logs -f remnawave_miniapp_backend

# Должно быть:
# ✅ PostgreSQL подключен: 2025-10-21...
# 🚀 MiniApp Backend запущен на порту 3001
```

### Проверка запросов

В режиме разработки все SQL запросы логируются:

```bash
npm run dev

# В консоли:
# 📊 SQL: { text: 'SELECT * FROM users...', duration: '15ms', rows: 1 }
```

### Health Check

```bash
curl http://localhost:3001/health

# Response:
# {"status":"ok","timestamp":"2025-10-21T...","service":"miniapp-backend"}
```

## Troubleshooting

### Ошибка: "password authentication failed"

```bash
# Проверьте пароль в .env
# Пересоздайте пользователя:
docker exec -it remnawave_bot_db psql -U remnawave_user -d remnawave_bot

DROP USER IF EXISTS miniapp_readonly;
-- Затем создайте заново
```

### Ошибка: "relation 'users' does not exist"

```bash
# Проверьте что таблица существует:
docker exec -it remnawave_bot_db psql -U remnawave_user -d remnawave_bot -c "\dt"

# Проверьте что вы подключаетесь к правильной БД
echo $POSTGRES_DB
```

### Ошибка: "permission denied for table users"

```bash
# Выдайте права заново:
GRANT SELECT ON ALL TABLES IN SCHEMA public TO miniapp_readonly;
```

### Backend не может подключиться к PostgreSQL

```bash
# Проверьте что оба контейнера в одной сети:
docker network inspect bot_network

# Должны быть:
# - remnawave_bot_db (postgres)
# - remnawave_miniapp_backend

# Если backend не в сети:
docker-compose down
docker-compose up -d
```

## Производительность

### Connection Pooling

Backend использует пул соединений (20 одновременных подключений):

```typescript
// backend/src/db.ts
max: 20,  // Измените если нужно больше
```

### Индексы БД

Убедитесь что есть индексы на часто используемых колонках:

```sql
-- Пример индексов для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_telegram_id);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON user_devices(user_telegram_id);
```

### Кэширование

Для дальнейшей оптимизации можно добавить Redis кэш:

```typescript
// Кэшировать результаты на 30 секунд
const cached = await redis.get(`user:${userId}:subscription`);
if (cached) return JSON.parse(cached);

const data = await query(...);
await redis.setex(`user:${userId}:subscription`, 30, JSON.stringify(data));
```

## Миграция с HTTP API

Если у вас уже работает HTTP API через бота:

1. **Сначала** запустите новый backend параллельно
2. **Протестируйте** что данные совпадают
3. **Переключите** frontend постепенно (feature flag)
4. **Удалите** старые HTTP эндпоинты из бота

```typescript
// Feature flag
const USE_DIRECT_DB = import.meta.env.VITE_USE_DIRECT_DB === 'true';

const getSubscription = USE_DIRECT_DB 
    ? getSubscriptionFromDB 
    : getSubscriptionFromBotAPI;
```

## Следующие шаги

- [ ] Создать read-only пользователя в PostgreSQL
- [ ] Адаптировать SQL запросы под вашу схему БД
- [ ] Запустить backend локально для тестирования
- [ ] Добавить backend в Docker Compose
- [ ] Обновить frontend для использования нового API
- [ ] Протестировать все эндпоинты
- [ ] Настроить мониторинг и логирование
- [ ] Добавить rate limiting (опционально)
- [ ] Настроить Nginx reverse proxy для production

## Поддержка

Если возникли проблемы:
1. Проверьте логи: `docker logs remnawave_miniapp_backend`
2. Проверьте подключение к БД
3. Проверьте что SQL запросы соответствуют вашей схеме
4. Проверьте сетевую конфигурацию Docker


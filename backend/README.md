# MiniApp Backend

Легкий Node.js backend для прямого чтения данных из PostgreSQL бота.

## Что делает?

- Подключается к БД бота через **read-only** пользователя
- Предоставляет REST API для MiniApp
- Валидирует Telegram initData для безопасности
- Кэширует подключения через connection pool

## API Endpoints

### GET /health
Проверка работоспособности
```bash
curl http://localhost:3001/health
```

### POST /api/subscription
Получение данных подписки
```json
{
  "initData": "query_id=..."
}
```

### POST /api/balance
Получение баланса пользователя

### POST /api/referral
Получение реферальных данных

## Установка

### 1. Переменные окружения

Создайте `.env` файл:
```bash
cp .env.example .env
# Отредактируйте .env
```

Или используйте скрипт:
```bash
bash ../scripts/setup-db-access.sh
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. ⚠️ ВАЖНО: Адаптация SQL запросов

Откройте `src/routes/` и замените названия таблиц/колонок на ваши:

```typescript
// Пример: если у вас tg_id вместо telegram_id
SELECT tg_id as telegram_id FROM users WHERE tg_id = $1
```

Проверить схему БД:
```bash
bash ../scripts/check-db-schema.sh
```

### 4. Запуск

```bash
# Разработка (с hot reload)
npm run dev

# Production
npm run build
npm start
```

## Docker

```bash
# Build
docker build -t remnawave-miniapp-backend .

# Run
docker run -d \
  --name miniapp-backend \
  --network bot_network \
  -p 3001:3001 \
  --env-file .env \
  remnawave-miniapp-backend
```

Или через docker-compose:
```bash
docker-compose -f ../docker/docker-compose.db-access.yml up -d
```

## Безопасность

### Read-only доступ
Пользователь БД имеет только SELECT права:
```sql
GRANT SELECT ON ALL TABLES TO miniapp_readonly;
```

### Валидация Telegram initData
Каждый запрос проверяется:
- HMAC SHA256 подпись
- Срок действия (24 часа)
- Целостность данных

### Сетевая изоляция
- Порт доступен только на `127.0.0.1`
- Или внутри Docker сети `bot_network`

## Структура

```
src/
├── index.ts              # Главный файл
├── db.ts                 # PostgreSQL connection pool
├── middleware/
│   ├── auth.ts          # Валидация initData
│   └── errorHandler.ts  # Обработка ошибок
└── routes/
    ├── subscription.ts  # Эндпоинты подписки
    ├── balance.ts       # Эндпоинты баланса
    └── referral.ts      # Эндпоинты рефералов
```

## Разработка

### Логирование

В режиме разработки выводятся SQL запросы:
```bash
npm run dev

# Вывод:
# 📊 SQL: { text: 'SELECT * FROM users...', duration: '15ms', rows: 1 }
```

### Тестирование

```bash
# Health check
curl http://localhost:3001/health

# Или используйте скрипт
bash ../scripts/test-backend.sh
```

### Отладка

```bash
# Логи Docker
docker logs -f remnawave_miniapp_backend

# Подключение к БД вручную
docker exec -it remnawave_bot_db psql -U miniapp_readonly -d remnawave_bot
```

## Производительность

- Connection pool: 20 одновременных подключений
- Таймаут запроса: 2 секунды
- Idle timeout: 30 секунд

Настройка в `src/db.ts`:
```typescript
new Pool({
  max: 20,  // Измените если нужно
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
})
```

## Troubleshooting

### Ошибка подключения к БД

```bash
# Проверьте переменные
cat .env | grep POSTGRES

# Проверьте что БД запущена
docker ps | grep postgres

# Проверьте сеть
docker network inspect bot_network
```

### Ошибка "permission denied"

```bash
# Пересоздайте пользователя
bash ../scripts/setup-db-access.sh
```

### 401 Unauthorized

```bash
# Проверьте BOT_TOKEN
echo $BOT_TOKEN

# Должен совпадать с токеном бота
```

## Лицензия

MIT


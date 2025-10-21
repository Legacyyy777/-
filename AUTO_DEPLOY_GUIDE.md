# 🚀 Автоматический деплой на VPS (для Bedolaga бота)

## Для бота: https://github.com/Fr1ngg/remnawave-bedolaga-telegram-bot

---

## 📋 Что нужно перед началом

На VPS уже должен работать:
- ✅ [Bedolaga бот](https://github.com/Fr1ngg/remnawave-bedolaga-telegram-bot)
- ✅ PostgreSQL (в Docker контейнере `remnawave_bot_db`)
- ✅ Redis (в Docker контейнере `remnawave_bot_redis`)

---

## 🎯 Деплой за 5 минут

### Шаг 1: На VPS - обновите код

```bash
# Перейдите в папку с проектами
cd /var/www  # или где у вас бот

# Клонируйте miniapp (если первый раз)
git clone https://github.com/ваш-username/miniapp.git
cd miniapp

# Или обновите (если уже есть)
cd miniapp
git pull origin main
```

### Шаг 2: Создайте read-only пользователя для БД

```bash
# Запустите автоматический скрипт
bash scripts/setup-db-access.sh
```

**Что делает скрипт:**
1. Создаёт пользователя `miniapp_readonly` в PostgreSQL
2. Даёт ему права только на чтение (SELECT)
3. Генерирует безопасный пароль
4. Создаёт файл `backend/.env` со всеми настройками
5. Проверяет подключение

**Готово!** Файл `backend/.env` создан автоматически.

### Шаг 3: Добавьте backend в docker-compose бота

```bash
# Откройте docker-compose.yml бота
cd /путь/к/bedolaga-bot
nano docker-compose.yml
```

Добавьте в **конец файла** (перед `volumes:` или `networks:`):

```yaml
  # MiniApp Backend - читает из БД бота
  miniapp-backend:
    build:
      context: /var/www/miniapp/backend  # Путь к папке backend
      dockerfile: Dockerfile
    container_name: remnawave_miniapp_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    env_file:
      - /var/www/miniapp/backend/.env    # Созданный setup скриптом
    ports:
      - "127.0.0.1:3001:3001"            # Только localhost
    networks:
      - bot_network                       # Та же сеть что и бот
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

Сохраните (Ctrl+O, Enter, Ctrl+X).

### Шаг 4: Соберите и запустите

```bash
# Соберите backend
docker-compose build miniapp-backend

# Запустите всё
docker-compose up -d
```

### Шаг 5: Проверьте что работает

```bash
# 1. Контейнер запущен?
docker ps | grep miniapp_backend

# 2. Health check
curl http://localhost:3001/health
# Должно: {"status":"ok",...}

# 3. Логи (важно!)
docker logs -f remnawave_miniapp_backend

# Должно быть:
# 📊 Найденные колонки users: [telegram_id, balance_kopeks, ...]
# ✅ Маппинг колонок определен
# ✅ PostgreSQL подключен: 2025-10-21...
# 🚀 MiniApp Backend запущен на порту 3001
```

**Если видите эти строки - всё работает! ✅**

---

## 🤖 Автоматическая адаптация схемы БД

Backend **сам определяет** названия колонок при первом запуске:

```
📊 Найденные колонки users: telegram_id, balance_kopeks, has_active_subscription...
✅ Маппинг колонок определен:
   telegram_id → telegram_id
   balance_kopeks → balance
   has_active_subscription → subscription_active
   ...
```

Не нужно вручную редактировать SQL запросы! 🎉

### Поддерживаемые варианты колонок

Backend распознаёт разные названия:

| Что ищет | Варианты |
|----------|----------|
| Telegram ID | `telegram_id`, `tg_id`, `user_id` |
| Баланс | `balance_kopeks`, `balance`, `balance_rub` |
| Активность подписки | `has_active_subscription`, `subscription_active`, `is_active` |
| Дата окончания | `subscribed_until`, `subscription_expires_at`, `expires_at` |
| Трафик лимит | `traffic_limit_gb`, `traffic_limit`, `data_limit_gb` |
| Трафик использовано | `traffic_used_gb`, `traffic_used`, `data_used_gb` |
| Лимит устройств | `device_limit`, `max_devices`, `devices_limit` |
| Реферальный код | `referral_code`, `ref_code`, `invite_code` |
| Кем приглашён | `referred_by`, `referrer_code`, `invited_by` |

Если в вашей БД названия другие - backend попробует найти их автоматически.

---

## 🌐 Настройка Nginx для HTTPS (опционально)

Если хотите доступ по `https://api.yourdomain.com`:

```bash
sudo nano /etc/nginx/sites-available/miniapp-api
```

```nginx
server {
    listen 443 ssl http2;
    server_name api.testminiapp.legacyyy777.site;

    ssl_certificate /etc/letsencrypt/live/testminiapp.legacyyy777.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/testminiapp.legacyyy777.site/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/miniapp-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Обновите `src/api/client.ts`:

```typescript
const API_BASE_URL = 'https://api.testminiapp.legacyyy777.site';
```

---

## 🔧 Обновление кода в будущем

Когда нужно обновить код:

```bash
# 1. Обновите код
cd /var/www/miniapp
git pull origin main

# 2. Пересоберите backend
cd /путь/к/bedolaga-bot
docker-compose build miniapp-backend

# 3. Перезапустите
docker-compose up -d
```

---

## ⚠️ Troubleshooting

### ❌ Ошибка: "permission denied for table users"

```bash
# Пересоздайте пользователя
bash scripts/setup-db-access.sh
```

### ❌ Backend не подключается к PostgreSQL

```bash
# Проверьте что оба в одной сети
docker network inspect bot_network

# Должны быть:
# - remnawave_bot_db
# - remnawave_miniapp_backend

# Проверьте переменные
cat backend/.env | grep POSTGRES
```

### ❌ Ошибка: "column does not exist"

```bash
# Посмотрите логи - там будет маппинг колонок
docker logs remnawave_miniapp_backend | grep "Маппинг"

# Проверьте схему БД
bash scripts/check-db-schema.sh
```

### ❌ 401 Unauthorized при запросах

```bash
# Проверьте BOT_TOKEN
cat backend/.env | grep BOT_TOKEN

# Должен совпадать с токеном бота
grep BOT_TOKEN /путь/к/боту/.env
```

---

## 📊 Структура на VPS после деплоя

```
/var/www/
├── bedolaga-bot/                  # Бот
│   ├── docker-compose.yml         # ← Добавили miniapp-backend
│   ├── .env
│   └── ...
│
└── miniapp/                       # MiniApp
    ├── backend/
    │   ├── .env                   # ← Создано setup скриптом
    │   ├── src/
    │   │   ├── db/
    │   │   │   └── schema-detector.ts  # Автоопределение схемы!
    │   │   └── routes/            # SQL запросы с автомаппингом
    │   └── Dockerfile
    ├── src/                       # Frontend
    └── scripts/
        └── setup-db-access.sh     # Автонастройка
```

---

## ✅ Чеклист после деплоя

- [ ] Backend запущен: `docker ps | grep miniapp_backend`
- [ ] Health OK: `curl localhost:3001/health`
- [ ] В логах есть "PostgreSQL подключен"
- [ ] В логах есть "Маппинг колонок определен"
- [ ] Нет ошибок в логах
- [ ] Frontend собран с правильным API_BASE_URL
- [ ] Тестовый запрос работает через MiniApp

---

## 🎉 Готово!

После деплоя:
- ✅ Backend читает данные напрямую из БД бота
- ✅ Автоматически адаптируется под схему
- ✅ Работает в той же Docker сети
- ✅ Read-only доступ (безопасно)
- ✅ Валидация Telegram initData

**Frontend теперь работает в 10x быстрее!** ⚡


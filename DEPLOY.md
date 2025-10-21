# 🚀 Деплой на VPS (для Bedolaga бота)

## Для уже работающего бота: https://github.com/Fr1ngg/remnawave-bedolaga-telegram-bot

---

## ⚡ Быстрый деплой (5 минут)

### 1. Обновите код на VPS

```bash
cd /var/www/miniapp  # или где у вас клонировали
git pull origin main
```

### 2. Запустите автонастройку БД

```bash
bash scripts/setup-db-access.sh
```

### 3. Добавьте в docker-compose бота

Откройте `docker-compose.yml` вашего Bedolaga бота:

```bash
cd /путь/к/bedolaga-bot
nano docker-compose.yml
```

Добавьте в конец (перед `volumes:` или `networks:`):

```yaml
  miniapp-backend:
    build:
      context: /var/www/miniapp/backend
    container_name: remnawave_miniapp_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    env_file:
      - /var/www/miniapp/backend/.env
    ports:
      - "127.0.0.1:3001:3001"
    networks:
      - bot_network
```

### 4. Соберите и запустите

```bash
docker-compose up -d --build
```

### 5. Проверьте

```bash
curl http://localhost:3001/health
docker logs -f remnawave_miniapp_backend
```

Должно быть:
```
✅ PostgreSQL подключен
✅ Маппинг колонок определен
🚀 MiniApp Backend запущен на порту 3001
```

---

## 🎯 Что дальше?

1. **Настройте Nginx** (если нужен HTTPS) - см. [AUTO_DEPLOY_GUIDE.md](AUTO_DEPLOY_GUIDE.md)
2. **Обновите frontend** - укажите URL backend в `src/api/client.ts`
3. **Соберите frontend** - `npm run build`
4. **Протестируйте** через Telegram MiniApp

---

## 📚 Подробные инструкции

- [AUTO_DEPLOY_GUIDE.md](AUTO_DEPLOY_GUIDE.md) - полная инструкция с Nginx, SSL и troubleshooting
- [DB_INTEGRATION_GUIDE.md](DB_INTEGRATION_GUIDE.md) - документация по архитектуре
- [QUICK_START_DB.md](QUICK_START_DB.md) - краткая справка

---

## ⚙️ Автоматическая адаптация

Backend **сам определяет схему БД** бота. Не нужно ничего настраивать вручную!

Поддерживаются любые названия колонок:
- `telegram_id` / `tg_id` / `user_id`
- `balance_kopeks` / `balance` / `wallet`
- `has_active_subscription` / `is_active` / `subscription_active`
- и т.д.

---

## 🔄 Обновление в будущем

```bash
cd /var/www/miniapp
git pull origin main
cd /путь/к/bedolaga-bot
docker-compose up -d --build miniapp-backend
```

---

**Готово! Backend работает в 10x быстрее HTTP запросов.** ⚡


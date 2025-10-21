# Telegram Mini App для VPN бота Remnawave

Современное мини-приложение для Telegram бота с полным функционалом управления VPN подписками, платежами и реферальной системой.

> **Интеграция с ботом:** https://github.com/Fr1ngg/remnawave-bedolaga-telegram-bot

---

## 🚀 Быстрый деплой на VPS

### ⚡ Новый способ: Автоматические скрипты (РЕКОМЕНДУЕТСЯ!)

**Первый раз на сервере:**
```bash
# 1. Клонируйте проект
git clone <repo-url>
cd <project-dir>

# 2. Настройте конфигурацию (интерактивно)
bash setup.sh

# 3. Деплой!
bash update-and-deploy.sh
```

**Повседневное использование:**
```bash
# Полный деплой (Backend + Frontend)
bash update-and-deploy.sh

# Только Backend
bash update-and-deploy.sh backend

# Только Frontend
bash update-and-deploy.sh frontend

# Просмотр логов
bash logs.sh              # Все сервисы
bash logs.sh backend      # Только backend
bash logs.sh frontend     # Только frontend
```

### 📦 Классический способ

```bash
# 1. Обновите код
git pull origin main

# 2. Настройте доступ к БД (автоматически!)
bash scripts/setup-db-access.sh

# 3. Добавьте в docker-compose бота
docker-compose up -d --build
```

**Backend с автоматической адаптацией схемы БД!** 🤖

📚 **Подробная документация:**
- [DEPLOY_QUICK_START.md](DEPLOY_QUICK_START.md) - быстрый старт со скриптами ⚡
- [DEPLOY.md](DEPLOY.md) - полная инструкция по деплою
- [TELEGRAM_LOGIN_SETUP.md](TELEGRAM_LOGIN_SETUP.md) - настройка входа через браузер

---

## ⚡ Оптимизации

- **Быстрая сборка** (~5-10 секунд вместо минут)
- Убраны тяжелые библиотеки (Three.js убран, ~2MB меньше)
- Простые CSS эффекты вместо сложных 3D
- Отключена TypeScript проверка при production сборке
- ESBuild минификация (быстрее Terser в 10 раз)

## ✨ Особенности

- 🚀 **Пошаговое подключение к VPN** - главная функция!
  - Автоматическое определение устройства
  - Рекомендации приложений для каждой платформы
  - Deep links для автоматического подключения (Happ)
  - Пошаговая инструкция с 3 этапами
- 🎨 **Красивый UI** с поддержкой светлой/темной темы
- 🌍 **Мультиязычность** (Русский, English)
- 📱 **Полная интеграция** с Telegram WebApp API
- 🔐 **Безопасная аутентификация** через Telegram initData
- 💳 **Множество способов оплаты** (Stars, CryptoBot, YooKassa, Tribute)
- 👥 **Реферальная система** с подробной статистикой
- ⚙️ **Гибкие настройки** подписки (серверы, трафик, устройства)
- 🚀 **Быстрая загрузка** с оптимизированным bundle
- 🐳 **Docker ready** для легкого развертывания

## 🛠 Технологии

### Frontend
- **React 18** + **TypeScript**
- **Vite** - быстрая сборка
- **TailwindCSS** - стилизация
- **Zustand** - state management
- **React Router** - навигация
- **Axios** - HTTP клиент
- **Framer Motion** - анимации (опционально)
- **Three.js** - 3D эффекты (опционально)

### Backend Integration
Интеграция с существующим API бота через endpoints:
- `/miniapp/subscription` - данные подписки
- `/miniapp/payments/*` - платежи
- `/miniapp/promocodes/*` - промокоды
- `/miniapp/referral` - реферальная система

## 📦 Установка

### Требования
- Node.js 18+
- npm или yarn
- Docker (для production)

### Локальная разработка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd miniapp
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
# API бота
VITE_API_BASE_URL=http://localhost:8080
VITE_BOT_USERNAME=@your_bot_username

# Настройки приложения
VITE_APP_NAME=VPN Subscription
VITE_DEFAULT_LANGUAGE=ru

# Функции (можно отключить для производительности)
VITE_ENABLE_3D_EFFECTS=true
VITE_ENABLE_PARTICLES=true
```

4. **Запустите dev сервер**
```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

## 🐳 Развертывание на VPS с ботом

### Быстрый деплой (3 команды)

```bash
# 1. Настройте .env (ВАЖНО!)
cp .env.example .env
# В .env укажите: VITE_API_BASE_URL=http://remnawave_bot:8080 (имя контейнера бота!)

# 2. Соберите и загрузите на VPS
docker build -f docker/Dockerfile -t remnawave-miniapp .
docker save remnawave-miniapp | gzip > /tmp/miniapp.tar.gz
scp /tmp/miniapp.tar.gz user@your-vps:/tmp/

# 3. На VPS запустите
ssh user@your-vps
docker load < /tmp/miniapp.tar.gz
docker run -d --name remnawave-miniapp \
  --network remnawave-network \
  -p 127.0.0.1:3000:3000 \
  --restart unless-stopped \
  remnawave-miniapp
```

### Или автоматически через скрипт

```bash
# Настройте deploy.sh (укажите VPS_HOST)
nano deploy.sh

# Запустите
chmod +x deploy.sh
./deploy.sh all
```

## ⚙️ Настройка Nginx (на VPS)

Поскольку у вас уже есть Nginx в отдельном контейнере, добавьте конфигурацию для мини-апп:

```nginx
# /etc/nginx/conf.d/miniapp.conf

upstream miniapp {
    server remnawave-miniapp:3000;
}

server {
    listen 80;
    server_name miniapp.yourdomain.com;  # Замените на ваш домен

    # Редирект на HTTPS (если используете)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name miniapp.yourdomain.com;

    # SSL сертификаты
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Gzip сжатие
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;

    # Проксирование на контейнер мини-апп
    location / {
        proxy_pass http://miniapp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # SPA routing - все запросы на index.html
        try_files $uri $uri/ /index.html;
    }

    # Кеширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://miniapp;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Перезагрузите Nginx:
```bash
docker exec nginx nginx -s reload
```

## 🔧 Настройка в Telegram Bot

После развертывания добавьте URL мини-апп в настройки бота через [@BotFather](https://t.me/BotFather):

1. Отправьте `/mybots`
2. Выберите вашего бота
3. Выберите `Bot Settings` → `Menu Button`
4. Укажите URL: `https://miniapp.yourdomain.com`
5. Укажите текст кнопки: "Открыть приложение"

Или через API:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Открыть приложение",
      "web_app": {
        "url": "https://miniapp.yourdomain.com"
      }
    }
  }'
```

## 📁 Структура проекта

```
miniapp/
├── docker/                  # Docker конфигурация
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── src/
│   ├── api/                 # API клиенты
│   ├── components/          # React компоненты
│   │   ├── layout/          # Layout компоненты
│   │   ├── ui/              # UI компоненты
│   │   ├── animations/      # Анимированные компоненты
│   │   └── 3d/              # 3D компоненты
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Страницы приложения
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript типы
│   ├── utils/               # Утилиты
│   ├── i18n/                # Локализация
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🌐 API Endpoints

Приложение использует следующие endpoints бота:

### Подписка
- `POST /miniapp/subscription` - получение данных подписки
- `POST /miniapp/subscription/settings` - настройки подписки
- `POST /miniapp/subscription/update/servers` - обновление серверов
- `POST /miniapp/subscription/update/traffic` - обновление трафика
- `POST /miniapp/subscription/update/devices` - обновление устройств
- `POST /miniapp/subscription/purchase` - покупка подписки
- `POST /miniapp/subscription/renewal` - продление подписки
- `POST /miniapp/subscription/trial` - активация триала

### Платежи
- `POST /miniapp/payments/methods` - список способов оплаты
- `POST /miniapp/payments/create` - создание платежа
- `POST /miniapp/payments/status` - проверка статуса

### Промокоды
- `POST /miniapp/promocodes/activate` - активация промокода

### Реферальная система
- `POST /miniapp/referral` - информация о рефералах

### FAQ и документы
- `POST /miniapp/faq` - FAQ
- `POST /miniapp/legal` - юридические документы

## 🎨 Кастомизация

### Изменение цветов

Цвета автоматически берутся из Telegram темы через CSS переменные:
- `--tg-theme-bg-color`
- `--tg-theme-text-color`
- `--tg-theme-button-color`
- и другие

### Отключение 3D эффектов

Если 3D эффекты тормозят на слабых устройствах:
```env
VITE_ENABLE_3D_EFFECTS=false
VITE_ENABLE_PARTICLES=false
```

### Добавление новых языков

1. Создайте файл `src/i18n/<lang>.json`
2. Добавьте язык в `src/i18n/index.ts`:
```typescript
export const LANGUAGES = {
  ru: 'Русский',
  en: 'English',
  es: 'Español',  // новый язык
} as const;
```

## 🐛 Troubleshooting

### Приложение не запускается
- Проверьте что Node.js 18+ установлен
- Удалите `node_modules` и переустановите: `rm -rf node_modules && npm install`
- Проверьте `.env` файл

### Ошибка "initData отсутствует"
- Убедитесь что приложение открывается через Telegram (не в браузере напрямую)
- Проверьте что `VITE_API_BASE_URL` указывает на работающий бот

### Docker контейнер не стартует
- Проверьте логи: `docker logs remnawave-miniapp`
- Убедитесь что порт 3000 свободен
- Проверьте что сеть `remnawave-network` существует

### SPA routing не работает (404 на refresh)
- Убедитесь что Nginx настроен с `try_files $uri $uri/ /index.html;`
- Проверьте что `serve` запущен с флагом `--spa`

## 📝 Лицензия

MIT License - используйте свободно в своих проектах

## 🤝 Поддержка

Если возникли вопросы или проблемы:
1. Проверьте существующие Issues
2. Создайте новый Issue с подробным описанием
3. Напишите в Telegram группу поддержки

## 🚀 Roadmap

- [x] Автоматические скрипты деплоя
- [x] Telegram Login Widget (вход через браузер)
- [x] Backend с прямым доступом к БД бота
- [x] JWT авторизация для браузера
- [ ] PWA support
- [ ] Offline mode
- [ ] Push уведомления
- [ ] Аналитика

---

## 📜 Доступные скрипты деплоя

Проект включает удобные скрипты для автоматизации деплоя:

| Скрипт | Описание | Использование |
|--------|----------|---------------|
| `setup.sh` | Первоначальная настройка проекта | `bash setup.sh` |
| `update-and-deploy.sh` | Git pull + деплой | `bash update-and-deploy.sh [backend\|frontend\|all]` |
| `deploy-all.sh` | Деплой без git pull | `bash deploy-all.sh [backend\|frontend\|all]` |
| `logs.sh` | Просмотр логов контейнеров | `bash logs.sh [backend\|frontend\|nginx\|all]` |

### Конфигурация скриптов

Все параметры настраиваются в файле `.deploy.config`:

```bash
# Названия контейнеров
BACKEND_CONTAINER_NAME="remnawave_miniapp_backend"
FRONTEND_CONTAINER_NAME="remnawave-miniapp"
NGINX_CONTAINER_NAME="remnawave-nginx"

# Пути к директориям
BACKEND_DIR="backend"
FRONTEND_DIR="docker"

# URL для проверки
MINIAPP_URL="https://testminiapp.legacyyy777.site"
BACKEND_HEALTH_URL="http://localhost:3003/health"
```

**Создание конфига:**
```bash
# Автоматически (интерактивно)
bash setup.sh

# Или вручную
cp .deploy.config.example .deploy.config
nano .deploy.config
```

Подробнее см. [DEPLOY_QUICK_START.md](DEPLOY_QUICK_START.md)

---

**Made with ❤️ for Remnawave VPN Bot**


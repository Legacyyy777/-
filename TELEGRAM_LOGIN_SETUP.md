# 🔐 Настройка Telegram Login Widget

Telegram Login Widget позволяет пользователям авторизоваться через Telegram прямо в браузере.

## Шаг 1: Настройка бота в BotFather

1. **Откройте Telegram** и найдите [@BotFather](https://t.me/botfather)

2. **Отправьте команду** `/setdomain`

3. **Выберите вашего бота**

4. **Введите домен** вашего MiniApp (например: `testminiapp.legacyyy777.site`)

5. **Готово!** BotFather подтвердит настройку

## Шаг 2: Обновите файл login.html

В файле `public/login.html` замените:

```html
data-telegram-login="YOUR_BOT_USERNAME"
```

На:

```html
data-telegram-login="ваш_bot_username"
```

*Например:* `data-telegram-login="remnawave_bot"`

## Шаг 3: Настройте .env

Добавьте в `/root/-/backend/.env`:

```bash
# JWT секрет (любая случайная строка)
JWT_SECRET="ваш_секретный_ключ_для_jwt"

# Или оставьте пустым - будет использован BOT_TOKEN
```

## Шаг 4: Деплой

```bash
cd /root/-
bash update-and-deploy.sh
```

## Шаг 5: Проверка

Откройте в браузере:
```
https://testminiapp.legacyyy777.site/login.html
```

Должна появиться кнопка **"Log in with Telegram"**

## Как это работает

1. **Пользователь кликает "Login with Telegram"**
2. **Telegram открывает popup** с подтверждением
3. **После подтверждения** Telegram передаёт данные на ваш сайт
4. **Backend проверяет подпись** от Telegram
5. **Backend создаёт JWT токен** для пользователя
6. **Фронтенд сохраняет токен** в localStorage
7. **Редирект на главную** страницу miniapp

## Безопасность

✅ **Данные от Telegram подписаны** - невозможно подделать  
✅ **Проверка актуальности** - данные не старше 24 часов  
✅ **JWT токены** с истечением через 30 дней  
✅ **Хеширование с BOT_TOKEN** как секретом  

## Troubleshooting

### Кнопка не появляется
- Проверьте что домен настроен в BotFather
- Проверьте `data-telegram-login` в login.html

### Ошибка "Неверные данные авторизации"
- Проверьте что `BOT_TOKEN` правильный в .env
- Перезапустите backend: `docker restart remnawave_miniapp_backend`

### Ошибка CORS
- Убедитесь что `ALLOWED_ORIGINS` в .env включает ваш домен


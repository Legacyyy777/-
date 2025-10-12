# Multi-stage Dockerfile для Telegram Mini App

# Этап 1: Сборка приложения
FROM node:18-alpine AS builder

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем все файлы проекта
COPY . .

# Сборка production build
RUN npm run build

# Этап 2: Production окружение с простым сервером
FROM node:18-alpine AS runtime

# Устанавливаем serve для раздачи статики
RUN npm install -g serve

# Рабочая директория
WORKDIR /app

# Копируем собранное приложение из builder
COPY --from=builder /app/dist ./dist

# Порт приложения
EXPOSE 3000

# Запуск с флагом --spa для корректной работы React Router
CMD ["serve", "-s", "dist", "-l", "3000", "--no-clipboard"]


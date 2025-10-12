# Multi-stage Dockerfile для Telegram Mini App

# Этап 1: Сборка приложения
FROM node:18-alpine AS builder

# Build args для переменных окружения
ARG VITE_API_BASE_URL=http://remnawave_bot:8080
ARG VITE_BOT_USERNAME=@your_bot
ARG VITE_ENABLE_3D_EFFECTS=true
ARG VITE_ENABLE_PARTICLES=true
ARG VITE_APP_NAME=VPN Subscription
ARG VITE_DEFAULT_LANGUAGE=ru

# Рабочая директория
WORKDIR /app

# Копируем package.json
COPY package.json ./

# Устанавливаем ВСЕ зависимости (нужны для сборки)
RUN npm install

# Копируем все файлы проекта
COPY . .

# Создаём .env для Vite из build args
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env && \
    echo "VITE_BOT_USERNAME=${VITE_BOT_USERNAME}" >> .env && \
    echo "VITE_ENABLE_3D_EFFECTS=${VITE_ENABLE_3D_EFFECTS}" >> .env && \
    echo "VITE_ENABLE_PARTICLES=${VITE_ENABLE_PARTICLES}" >> .env && \
    echo "VITE_APP_NAME=${VITE_APP_NAME}" >> .env && \
    echo "VITE_DEFAULT_LANGUAGE=${VITE_DEFAULT_LANGUAGE}" >> .env

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


FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY src ./src

# Компилируем TypeScript
RUN npm run build

# Production образ
FROM node:20-alpine

WORKDIR /app

# Копируем только production зависимости
COPY package*.json ./
RUN npm install --omit=dev

# Копируем скомпилированный код
COPY --from=builder /app/dist ./dist

# Не root пользователь
USER node

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3001

CMD ["node", "dist/index.js"]


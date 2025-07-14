# Dockerfile para SvelteKit (producción)
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Variables de entorno para el build (SvelteKit necesita VITE_ en build time)
ARG GOOGLE_ID
ARG GOOGLE_SECRET
ARG AUTH_SECRET
ARG VITE_MONGODB_URI
ARG VITE_TEST_NAME
ARG VITE_TEST_THEMES

ENV GOOGLE_ID=$GOOGLE_ID
ENV GOOGLE_SECRET=$GOOGLE_SECRET
ENV AUTH_SECRET=$AUTH_SECRET
ENV VITE_MONGODB_URI=$VITE_MONGODB_URI
ENV VITE_TEST_NAME=$VITE_TEST_NAME
ENV VITE_TEST_THEMES=$VITE_TEST_THEMES

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar solo lo necesario para producción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "build/index.js"]
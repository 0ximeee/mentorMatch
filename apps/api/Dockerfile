FROM node:22-slim AS base
WORKDIR /app
# openssl lo necesitará Prisma más adelante
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./

# Desarrollo local (docker compose usa esta etapa)
FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Compilación 
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Producción (Render usa esta, por ser la última etapa)
FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
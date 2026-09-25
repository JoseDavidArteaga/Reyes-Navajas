# syntax=docker/dockerfile:1
# Skill: multi-stage-dockerfile — build Angular + serve estático con nginx
FROM node:18.20-alpine AS builder
WORKDIR /app
# Dependencias primero para aprovechar caché
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/reyes-navajas-frontend /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

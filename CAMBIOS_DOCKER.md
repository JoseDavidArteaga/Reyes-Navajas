# Registro de cambios — Dockerización full-stack

Fecha: 2026-09-16
Objetivo: correr todo el sistema (`MySQL + Keycloak + RabbitMQ + 6 micros + frontend`) con un solo `docker compose up --build -d`.

## Archivos nuevos

| Archivo | Descripción |
|---|---|
| `docker-compose.yml` | Orquesta 10 servicios: `mysql`, `rabbitmq`, `keycloak`, `usuarios` (8085), `auth` (8084), `catalogo` (8083), `turnos` (8088), `notificaciones` (8091), `gateway` (8089), `frontend` (4200→80). Red `barberia-net`, `depends_on` por health, `restart: unless-stopped`. |
| `apiGateway/Dockerfile` | Multi-stage `maven:3.9.9-eclipse-temurin-21-jammy` → `eclipse-temurin:21-jre-jammy`, usuario `appuser`, healthcheck `/actuator/health:8089`. |
| `microUsuarios/Dockerfile` | Reescrito (el anterior apuntaba a `postgres-login:5432/login_db` y al realm `MicroserviceSPM`). Ahora Java 21 + MySQL + healthcheck `:8085`. |
| `microAutenticacion/Dockerfile` | Nuevo, Java 21, healthcheck `:8084`. |
| `microCatalogo/Dockerfile` | Nuevo, Java 17 (lo exige su `pom.xml`), volumen `/app/uploads`, healthcheck `:8083`. |
| `microServiceTurnos/Dockerfile` | Nuevo, Java 21, healthcheck `:8088`. |
| `microNotificaciones/Dockerfile` | Nuevo, Java 21, healthcheck `:8091`. |
| `frontend/Dockerfile` | Nuevo, `node:18.20-alpine` (build) → `nginx:1.27-alpine` (serve de `dist/reyes-navajas-frontend`). |
| `frontend/nginx.conf` | SPA fallback a `index.html` + cacheo de assets con hash. |
| `*/.dockerignore` | En los 6 micros y el frontend (excluye `target/`, `node_modules/`, `dist/`, `.git/`). |
| `docker/mysql-init/01-databases.sql` | Crea `barberia`, `catalogo_db` y `turnos_db` en un solo MySQL 8. |
| `keycloak/realm-export.json` | Realm `MicroservicesBarber`, clients `barber-service` (público, redirect `http://localhost:4200/*`) y `auth-service` (confidencial), roles `ADMINISTRADOR/BARBERO/CLIENTE` y 7 usuarios (`admin123`). Import automático con `--import-realm`. |
| `.env.example` | Variables (`MYSQL_ROOT_PASSWORD`, `MYSQL_PORT`, `KEYCLOAK_ADMIN*`, `KEYCLOAK_CLIENT_SECRET`). El compose funciona sin `.env`. |
| `DOCKER.md` | Guía de despliegue, puertos, comandos útiles y modo solo-infra para desarrollo local. |

Todos los `Dockerfile` siguen la skill `.opencode/skills/multi-stage-dockerfile`: etapa builder solo compila,
etapa runtime mínima, tags exactos, dependencias antes que código (caché), `USER appuser`, `HEALTHCHECK`.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `apiGateway/src/main/resources/application.yml` | Rutas parametrizadas (`CATALOGO_URL`, `TURNOS_URL`, `USUARIOS_URL`, `AUTH_URL`), JWT con `KEYCLOAK_ISSUER_URI` / `KEYCLOAK_JWK_SET_URI` separados, `management.health` expuesto. |
| `microUsuarios/src/main/resources/application.yml` | Datasource por env (`MYSQL_HOST/PORT/DB_USUARIOS/USER/PASSWORD` + `createDatabaseIfNotExist`), RabbitMQ por env, `management.health`. |
| `microCatalogo/src/main/resources/application.yml` | Datasource (`MYSQL_DB_CATALOGO`), RabbitMQ, `APP_BASE_URL`, `APP_UPLOAD_DIR` por env, `management.health`. |
| `microServiceTurnos/src/main/resources/application.yml` | Datasource (`MYSQL_DB_TURNOS`), `USUARIOS_SERVICE_URL` por env (en Docker: `http://gateway:8089/usuarios`), `management.health`. |
| `microAutenticacion/src/main/resources/application.yml` | RabbitMQ y `keycloak.*` (`KEYCLOAK_URL/REALM/CLIENT_ID/CLIENT_SECRET`) por env. |
| `microNotificaciones/src/main/resources/application.yml` | RabbitMQ y `twilio.*` por env, `management.health`. |
| `microUsuarios/pom.xml`, `microCatalogo/pom.xml`, `microServiceTurnos/pom.xml`, `microNotificaciones/pom.xml` | Agregado `spring-boot-starter-actuator` (el README ya documentaba `/actuator/health` en esos servicios). |

Todos los defaults siguen siendo `localhost`, así que el modo manual (`./mvnw spring-boot:run` + `ng serve`) no se rompe.

## Decisiones

- **Un solo MySQL con 3 BD** (simple y liviano) en vez de uno por micro.
- **Keycloak con import automático** del realm; si se agregan usuarios/roles en `/admin`, re-exportar a `keycloak/realm-export.json`.
- **Desdoble JWT en Docker**: el navegador firma contra `http://localhost:8080` pero el gateway descarga las llaves por `http://keycloak:8080` (red interna). Ver `KEYCLOAK_ISSUER_URI` / `KEYCLOAK_JWK_SET_URI` en el compose.
- **`turnos` espera al `gateway`** (`depends_on` healthy) porque llama a `http://gateway:8089/usuarios`; el gateway no espera a `turnos` para evitar ciclo.
- **Contraseña MySQL en Docker**: `root`/`root` (`MYSQL_ROOT_PASSWORD`); en local XAMPP sigue sin contraseña.

## Verificación hecha

- `docker compose config` → válido (10 servicios, redes y volúmenes correctos).
- `realm-export.json` → JSON válido (2 clients, 7 usuarios).
- Pendiente de runtime: el daemon de Docker Desktop estaba apagado al momento del cambio; validar con `docker compose up --build -d` + `curl http://localhost:8089/actuator/health`.

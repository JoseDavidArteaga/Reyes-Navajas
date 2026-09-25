# CONTEXTO — Barbería Reyes Navajas (despliegue demo en la nube)

> Última actualización: 2026-09-25. Rama `main` de
> `github.com/JoseDavidArteaga/Reyes-Navajas`, al día hasta commit `f305f25e`.
> Si retomas en una sesión nueva de opencode, pega este archivo y di dónde quedaste.

## 1. Qué es el proyecto

Sistema de barbería con microservicios: 6 backend Spring Boot (gateway :8089, usuarios :8085,
auth :8084, catálogo :8083, turnos :8088, notificaciones :8091) + frontend Angular 17
+ Keycloak 24 (realm `MicroservicesBarber`) + MySQL 8 (3 BD: `barberia`, `catalogo_db`,
`turnos_db`) + RabbitMQ. Local se levanta con `docker compose up --build -d` (10 servicios).

## 2. Decisiones tomadas (no re-discutir)

| Decisión | Valor |
|---|---|
| Frontend prod | **Vercel**, proyecto **`reyes-navajas`** → `https://reyes-navajas.vercel.app` (el realm prod ya espera esa URL) |
| Backend + BD | **Opción A**: todo en OCI — VM ARM Always Free + **MySQL HeatWave Always Free** (único gratis compatible MySQL 8, sin cambios Java) + frontend en Vercel |
| Región OCI | Home **`sa-bogota-1` (Bogotá)** — el usuario está en Colombia. Verificar en consola que ofrezca HeatWave Always Free + ARM; fallback São Paulo |
| Dominio backend | Sin dominio propio: esquema **nip.io** → `https://api.<IP-con-guiones>.nip.io` (gateway), `https://auth.<IP-con-guiones>.nip.io` (Keycloak), con Let's Encrypt vía Nginx+certbot en la VM |
| Credenciales | **Demo**: se mantienen `admin123` (7 usuarios Keycloak) y secretos default. Nada real (Twilio `xx`, WhatsApp ejemplo) |
| Notificaciones demo | Sin riesgo: turnos publica en RabbitMQ con try/catch; notificaciones captura el error de Twilio y confirma el mensaje (sin bucle de reintentos). Los SMS simplemente fallan en logs |

## 3. Estado: qué está hecho y verificado

- [x] **Fix Dockerfiles**: `maven:3.9.9-eclipse-temurin-{21,17}-jammy` NO existen → se quitó el sufijo `-jammy` en los 6 micros. Build `catalogo`+`gateway` verificado.
- [x] **Conflicto puerto 8080 local**: era Oracle XE (`TNSLSNR`, XDB HTTP). Se liberó con `EXEC DBMS_XDB.SETHTTPPORT(0);` como `system/oracle`. Oracle sigue en 1521. `docker compose up` local funciona (gateway UP, Keycloak 200, frontend 200).
- [x] **Fase 1 frontend multi-entorno**: `src/environments/environment.ts` (localhost) + `environment.prod.ts` (nip.io con TODO de IP), `fileReplacements` en `angular.json`, `.nvmrc` (Node 20), `api.config.ts` como único punto de verdad, 6 servicios sin `localhost` quemado. Builds dev y prod verificados (prod: cero `localhost`; dev: localhost OK).
- [x] **Fase 2 realm prod**: `keycloak/realm-export.prod.json` (redirectUris/webOrigins → `https://reyes-navajas.vercel.app`, 7 usuarios demo). JSON válido. **Orden crítico: crear el proyecto Vercel ANTES del primer arranque de Keycloak** (el realm se importa una sola vez).
- [x] **Compose prod**: `docker-compose.prod.yml` (excluye `mysql`/`frontend` por profiles, `depends_on: !override` para quitar mysql, HeatWave con `MYSQL_USE_SSL=true`, gateway con issuer público + CORS Vercel, Keycloak `start` + hostname + proxy xforwarded + realm prod). `config` validado. `.env.prod.example` creado (`.env.prod` real, ignorado).
- [x] **Backend TLS-ready**: `useSSL=${MYSQL_USE_SSL:false}` en usuarios/catálogo/turnos (HeatWave exige TLS).
- [x] **`deploy/`**: `nginx-reyes-navajas.conf.template` (api→8089, auth→8080, headers X-Forwarded, 10M uploads) + `vm-setup.sh` (Docker, Nginx, certbot, UFW 22/80/443, espera DNS, certificado). `bash -n` válido. `.gitattributes` fuerza LF en `*.sh`; `.gitignore` muestra `*.example`.
- [x] **`frontend/vercel.json`**: build Angular, output `dist/reyes-navajas-frontend`, rewrite SPA → `/index.html`. Commiteado y pusheado (`f305f25e`).

## 4. Dónde quedamos (próximo paso inmediato)

**El usuario iba a:** crear cuenta OCI (home Bogotá) y crear el proyecto Vercel `reyes-navajas`
(root `frontend/`, framework Angular, deploy). El sitio cargará el login pero fallará al
autenticar hasta que exista el backend (esperado: `environment.prod.ts` aún tiene el
placeholder `TU-IP-CON-GUIONES`).

**Secuencia pendiente:**
1. OCI: VCN (subred pública+privada, security list solo 22/80/443) → HeatWave Always Free en subred **privada** (anotar endpoint + crear usuario) → VM ARM Ubuntu 22.04 (subred pública, anotar IP).
2. Crear proyecto Vercel `reyes-navajas` (si sale otro nombre, ajustar `realm-export.prod.json` antes de arrancar Keycloak).
3. En la VM: clonar repo → `sudo BACKEND_HOST=<IP-con-guiones>.nip.io EMAIL=... bash deploy/vm-setup.sh` → rellenar `.env.prod` → reemplazar `TU-IP-CON-GUIONES` en `environment.prod.ts` → `docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build`.
4. Smoke test: `https://api.<HOST>/actuator/health` UP → realm 200 → login `jefe/admin123` → crear servicio con imagen → reservar turno → logs notificaciones.

## 5. Gotchas registrados (no re-descubrir)

- **bash**: apóstrofo dentro del mensaje de `${VAR:?...}` rompe el parseo aunque esté entrecomillado (el escáner de llaves lo trata como apertura de quote). No usar `'` ahí.
- **Compose v5**: `depends_on` a un servicio excluido por profiles es ERROR (no warning) → se usó `depends_on: !override` en el prod.
- **Keycloak prod**: issuer público para el `iss` del token, JWK por red interna; `webOrigins` del realm debe incluir Vercel (CORS del token endpoint); requiere HTTPS (de ahí Nginx+certbot).
- **Imágenes catálogo**: `CatalogoService` arma `baseUrl + "/catalogo/imagenes/..."` → `APP_BASE_URL=https://api.<HOST>` (sin sufijo) pasa por el gateway.
- **Vercel**: sin `rewrites` el refresh en rutas (/login…) da 404; Node fijado por `.nvmrc`; cada push a `main` redespliega solo.
- **Git**: identidad global ya configurada por el usuario. Commits en español, estilo repo.

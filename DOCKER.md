# Despliegue con Docker — Reyes Navajas

Un solo comando levanta todo el sistema (infra + 6 micros + frontend):

```bash
docker compose up --build -d
docker compose ps
```

## Servicios y puertos

| Servicio | Puerto local | Health |
|---|---|---|
| frontend | 4200 | `http://localhost:4200` |
| gateway | 8089 | `http://localhost:8089/actuator/health` |
| usuarios | 8085 | `...:8085/actuator/health` |
| auth | 8084 | `...:8084/actuator/health` |
| catalogo | 8083 | `...:8083/actuator/health` |
| turnos | 8088 | `...:8088/actuator/health` |
| notificaciones | 8091 | `...:8091/actuator/health` |
| keycloak | 8080 | `http://localhost:8080/realms/MicroservicesBarber` |
| mysql | 3306 | `docker compose exec mysql mysqladmin ping -h localhost -uroot -proot` |
| rabbitmq | 5672 / 15672 | `http://localhost:15672` (guest/guest) |

## Notas importantes

- **MySQL único con 3 BD**: `barberia`, `catalogo_db`, `turnos_db` (ver `docker/mysql-init/01-databases.sql`).
  En Docker la contraseña de `root` es `root` (variable `MYSQL_ROOT_PASSWORD`). En local (XAMPP)
  sigue funcionando sin contraseña porque los `application.yml` usan `localhost` por defecto.
- **Keycloak automático**: importa `keycloak/realm-export.json` al arrancar (realm
  `MicroservicesBarber`, client público `barber-service`, client `auth-service` y los 7 usuarios
  de prueba con `admin123`). Si agregas roles/usuarios en `/admin`, expórtalos de vuelta a ese archivo.
- **JWT en Docker**: el navegador firma contra `http://localhost:8080` pero el gateway lee las llaves
  por `http://keycloak:8080` (ver `KEYCLOAK_ISSUER_URI` / `KEYCLOAK_JWK_SET_URI` en el compose). No cambiar
  sin entender ese desdoble.
- **Imágenes de servicios**: persisten en el volumen `catalogo_uploads` (`/app/uploads`).
- **Orden de arranque**: lo maneja `depends_on` + `healthcheck`. `turnos` espera al `gateway`
  porque llama a `http://gateway:8089/usuarios`.

## Comandos útiles

```bash
docker compose logs -f gateway        # ver logs de un servicio
docker compose logs -f usuarios auth catalogo turnos
docker compose down                   # apagar (conserva datos)
docker compose down -v                # apagar y BORRAR datos (mysql, uploads, keycloak)
docker compose up --build <servicio>  # reconstruir solo uno, ej: catalogo
```

## Desarrollo local (sin Docker para código)

El compose también sirve solo como infra:

```bash
docker compose up -d mysql rabbitmq keycloak
```

y luego corres los micros con `./mvnw spring-boot:run` y el frontend con `ng serve`, que siguen
apuntando a `localhost` por defecto.

# Sistema de Barbería - Microservicios

Sistema completo de gestión de barbería construido con microservicios usando Spring Boot para el backend, Angular para el frontend, Keycloak para autenticación y MySQL para persistencia de datos.

## 🏗️ Arquitectura del Sistema

### Microservicios Backend
- **API Gateway** (Puerto 8089) - Enrutamiento de peticiones
- **Microservicio Usuarios** (Puerto 8085) - Gestión de usuarios y roles
- **Microservicio Autenticación** (Puerto 8084) - Validación de tokens JWT
- **Microservicio Catálogo** (Puerto 8083) - Gestión de servicios de barbería
- **Microservicio Turnos** (Puerto 8088) - Gestión de citas y reservas
- **Microservicio Notificaciones** - Sistema de notificaciones

### Frontend y Servicios Externos
- **Frontend Angular** (Puerto 4200) - Interfaz de usuario
- **Keycloak** (Puerto 8080) - Servidor de autenticación JWT
- **MySQL** (Puerto 3306) - Base de datos principal
- **RabbitMQ** - Cola de mensajes para comunicación entre microservicios

## 📋 Prerrequisitos

### Software Requerido
- **Java JDK 21** - Para los microservicios Spring Boot
- **Node.js 18+** y **npm** - Para el frontend Angular
- **MySQL 8.0+** - Base de datos (se recomienda XAMPP)
- **Keycloak 24+** - Servidor de autenticación
- **Git** - Control de versiones

### Herramientas Recomendadas
- **XAMPP** - Para MySQL y phpMyAdmin
- **Docker** (opcional) - Para Keycloak y RabbitMQ
- **Postman** - Para testing de APIs

## 🚀 Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/JoseDavidArteaga/Reyes-Navajas.git
cd Reyes-Navajas
```

### 2. Configurar Base de Datos MySQL

#### Opción A: Usando XAMPP
1. Descargar e instalar [XAMPP](https://www.apachefriends.org/)
2. Iniciar Apache y MySQL desde el panel de control de XAMPP
3. Abrir phpMyAdmin en `http://localhost/phpmyadmin`
4. Crear base de datos `bdpruebas`

#### Opción B: MySQL directo
```sql
CREATE DATABASE bdpruebas;
USE bdpruebas;
```

#### Ejecutar Script de Datos Iniciales
```bash
# Conectar a MySQL
mysql -u root -p -h localhost bdpruebas

# Ejecutar el script de usuarios
source insert_usuarios_prueba.sql
```

### 3. Configurar Keycloak

#### Instalación con Docker (Recomendado)
```bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:24.0.0 start-dev
```

#### Configurar Realm y Client
1. Acceder a `http://localhost:8080/admin`
2. Login con `admin/admin`
3. Crear nuevo Realm: `MicroservicesBarber`
4. Configurar Client `barber-service`:
   - **Access Type**: `public`
   - **Standard Flow Enabled**: `ON`
   - **Direct Access Grants Enabled**: `ON`
   - **Valid Redirect URIs**: `http://localhost:4200/*`
   - **Web Origins**: `http://localhost:4200`

#### Crear Usuarios de Prueba en Keycloak
Crear usuarios que coincidan con los de la base de datos:
- Username: `jefe` | Password: `admin123` | Roles: `ADMINISTRADOR`
- Username: `jesus` | Password: `admin123` | Roles: `BARBERO`
- Username: `carlos` | Password: `admin123` | Roles: `BARBERO`
- Username: `juan` | Password: `admin123` | Roles: `CLIENTE`

### 4. Instalar Dependencias del Frontend
```bash
cd frontend
npm install
cd ..
```

## 🎯 Ejecución del Sistema

### Orden de Ejecución (IMPORTANTE)
Seguir este orden específico para evitar errores de conexión:

#### 1. Servicios de Infraestructura
```bash
# 1. Iniciar MySQL (XAMPP o servicio directo)
# 2. Iniciar Keycloak
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:24.0.0 start-dev

# 3. Iniciar RabbitMQ (opcional para notificaciones)
docker run -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

#### 2. Microservicios Backend
```bash
# 1. API Gateway (PRIMERO)
cd apiGateway
./mvnw spring-boot:run
# Esperar que inicie en puerto 8089

# 2. Microservicio Usuarios
cd ../microUsuarios
./mvnw spring-boot:run
# Esperar que inicie en puerto 8085

# 3. Microservicio Autenticación
cd ../microAutenticacion
./mvnw spring-boot:run
# Esperar que inicie en puerto 8084

# 4. Microservicio Catálogo
cd ../microCatalogo
./mvnw spring-boot:run
# Esperar que inicie en puerto 8083

# 5. Microservicio Turnos
cd ../microServiceTurnos
./mvnw spring-boot:run
# Esperar que inicie en puerto 8088

# 6. Microservicio Notificaciones
cd ../microNotificaciones
./mvnw spring-boot:run
```

#### 3. Frontend Angular
```bash
cd frontend
ng serve
# Acceder a http://localhost:4200
```

### Verificar que todos los servicios estén funcionando:
```bash
# API Gateway
curl http://localhost:8089/actuator/health

# Microservicios
curl http://localhost:8085/actuator/health  # Usuarios
curl http://localhost:8084/actuator/health  # Autenticación
curl http://localhost:8083/actuator/health  # Catálogo
curl http://localhost:8088/actuator/health  # Turnos

# Keycloak
curl http://localhost:8080/realms/MicroservicesBarber

# Frontend
curl http://localhost:4200
```

## 👥 Usuarios de Prueba

### Credenciales para Testing
| Rol | Usuario | Teléfono | Contraseña |
|-----|---------|-----------|------------|
| **Administrador** | jefe | 3150001111 | admin123 |
| **Barbero** | jesus | 3156890634 | admin123 |
| **Barbero** | carlos | 3152223344 | admin123 |
| **Cliente** | juan | 3154445566 | admin123 |
| **Cliente** | mateo | 3157778899 | admin123 |
| **Cliente** | andres | 3161234567 | admin123 |
| **Cliente** | felipe | 3169876543 | admin123 |

## 📱 Uso de la Aplicación

### Flujo de Usuario
1. **Login**: Acceder con teléfono y contraseña
2. **Dashboard**: Vista según el rol (Admin/Barbero/Cliente)
3. **Gestión de Servicios**: Crear, editar y eliminar servicios (Admin)
4. **Reserva de Turnos**: Agendar citas (Cliente)
5. **Gestión de Turnos**: Administrar citas (Barbero/Admin)

### Endpoints Principales
- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:8089
- **Keycloak Admin**: http://localhost:8080/admin
- **phpMyAdmin**: http://localhost/phpmyadmin

## 🔧 Configuración

### Variables de Entorno
Cada microservicio tiene su `application.yml` con configuración específica:

#### Base de Datos (microUsuarios/application.yml)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/bdpruebas
    username: root
    password: oracle
```

#### Keycloak (frontend/src/app/core/config/api.config.ts)
```typescript
export const API_CONFIG = {
  GATEWAY_URL: 'http://localhost:8089',
  KEYCLOAK_URL: 'http://localhost:8080',
  KEYCLOAK_REALM: 'MicroservicesBarber',
  KEYCLOAK_CLIENT_ID: 'barber-service',
};
```


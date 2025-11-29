# Reyes & Navajas - Barbershop Management System Frontend

Sistema de gestión completo para barbería desarrollado con Angular 17+ y Tailwind CSS.

## Características Principales

### 🔐 Sistema de Autenticación
- Autenticación basada en JWT
- Roles de usuario (Cliente, Barbero, Administrador)
- Guards de protección de rutas
- Redirectión automática según rol

### 👥 Panel de Cliente
- **Reservar Cita**: Sistema intuitivo de reservas con selección de barbero, servicio y horario
- **Mis Reservas**: Vista completa de citas activas con opción de cancelación
- **Cola Virtual**: Sistema en tiempo real para ver el estado de la cola y tiempo de espera

### ✂️ Panel del Barbero
- **Agenda Diaria**: Vista completa de citas del día con filtros y gestión
- **Métricas**: Dashboard con estadísticas de rendimiento y servicios

### 👨‍💼 Panel de Administración
- **Gestión de Barberos**: CRUD completo para manejo de staff
- **Gestión de Servicios**: Administración del catálogo de servicios
- **Reportes**: Análisis de ocupación, cancelaciones y métricas de negocio

## Stack Tecnológico

- **Framework**: Angular 17+ con Standalone Components
- **Estilos**: Tailwind CSS con tema personalizado
- **Estado**: Angular Signals + RxJS
- **Validaciones**: Angular Reactive Forms
- **Notificaciones**: ngx-toastr
- **TypeScript**: Configuración estricta con path mapping
- **Build**: Angular CLI con optimizaciones

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios principales
│   │   ├── interfaces/          # Definiciones TypeScript
│   │   ├── services/           # Lógica de negocio
│   │   ├── guards/             # Protección de rutas
│   │   └── interceptors/       # HTTP interceptors
│   ├── shared/                 # Componentes compartidos
│   │   ├── components/         # UI components
│   │   └── utils/              # Utilidades
│   └── features/               # Módulos de funcionalidad
│       ├── auth/               # Autenticación
│       ├── cliente/            # Panel de cliente
│       ├── barbero/           # Panel de barbero
│       ├── admin/             # Panel administrativo
│       └── public/            # Páginas públicas
```

## Configuración de Desarrollo

### Prerrequisitos
- Node.js 18+
- Angular CLI 17+

### Instalación
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ng serve

# Build para producción
ng build --configuration production
```

### Scripts Disponibles
```bash
npm start           # Servidor de desarrollo
npm run build       # Build de producción
npm run test        # Ejecutar tests
npm run lint        # Linting del código
```

## Configuración de Tailwind CSS

El proyecto incluye una configuración personalizada de Tailwind con:
- Tema oscuro como predeterminado
- Palette de colores personalizada para barbería
- Tipografía optimizada
- Clases de utilidad personalizadas

### Colores Principales
- `barberia-gold`: #D4AF37 (Oro característico)
- `barberia-brown`: #8B4513 (Marrón complementario)

## Arquitectura de Componentes

### Standalone Components
Todos los componentes utilizan la nueva arquitectura de Angular 17+ sin módulos:
- Mejor tree-shaking
- Carga lazy por defecto
- Sintaxis más limpia

### Signal-based State
- Uso de Angular Signals para estado reactivo
- Mejor performance que observables tradicionales
- Sintaxis más simple y declarativa

### Guards de Ruta
- `authGuard`: Verificación de autenticación
- `adminGuard`: Acceso solo para administradores
- `barberoGuard`: Acceso solo para barberos
- `clienteGuard`: Acceso solo para clientes
- `guestGuard`: Acceso solo para usuarios no autenticados

## Servicios Principales

### AuthService
- Manejo completo de autenticación
- Gestión de tokens JWT
- Estado de usuario con signals

### BarberoService
- CRUD de barberos
- Gestión de especialidades
- Estadísticas de rendimiento

### ServicioService
- Catálogo de servicios
- Precios y duraciones
- Categorización

### ReservaService
- Sistema completo de reservas
- Validación de disponibilidad
- Gestión de cancelaciones

### ColaService
- Sistema de cola virtual en tiempo real
- Estimación de tiempos
- Notificaciones de estado

## Funcionalidades Implementadas

### ✅ Completado
- [x] Configuración base del proyecto
- [x] Sistema de autenticación completo
- [x] Interface de usuario responsive
- [x] Panel de cliente con todas las funcionalidades
- [x] Panel de barbero con agenda y métricas
- [x] Panel de administración completo
- [x] Servicios con datos mock para desarrollo
- [x] Validaciones de formularios
- [x] Sistema de notificaciones
- [x] Guards de protección de rutas

### 🔄 Próximas Mejoras
- [ ] Integración con backend real
- [ ] Tests unitarios y E2E
- [ ] PWA capabilities
- [ ] Notificaciones push
- [ ] Chat en tiempo real
- [ ] Integración de pagos

## Convenciones de Código

### Naming Convention
- Componentes: PascalCase
- Servicios: camelCase + Service
- Interfaces: PascalCase
- Variables y métodos: camelCase

### File Structure
- Un componente por archivo
- Barrel exports para módulos
- Path mapping configurado (@/core, @/shared, @/features)

### TypeScript
- Strict mode habilitado
- Interfaces para todas las entidades
- Tipos explícitos en servicios

## Responsive Design

El sistema está optimizado para:
- **Desktop**: Layout completo con sidebar
- **Tablet**: Navegación adaptiva
- **Mobile**: Interface táctil optimizada

### Breakpoints
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+

## Performance

### Optimizaciones Implementadas
- Lazy loading en todas las rutas
- OnPush change detection strategy
- Standalone components para mejor tree-shaking
- Signals para estado reactivo eficiente
- Tailwind CSS con purge para bundle optimizado

## Mantenimiento

### Actualización de Dependencias
```bash
ng update @angular/core @angular/cli
npm update
```

### Monitoreo de Bundle
```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/frontend/stats.json
```

---

**Desarrollado con ❤️ para Reyes & Navajas Barbershop**
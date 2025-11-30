# Assets del Frontend - Reyes & Navajas

Esta carpeta contiene todos los recursos estáticos utilizados en la aplicación frontend.

## Estructura de Carpetas

### 📁 images/
Contiene todas las imágenes utilizadas en la aplicación:
- Logos
- Iconos personalizados
- Imágenes de fondo
- Fotografías de servicios
- Assets de UI/UX

### 📁 3DModels/
Contiene modelos 3D utilizados en la aplicación:
- `estatua.glb` - Modelo 3D de la estatua dorada que aparece en la página de inicio (formato GLB optimizado)

## Modelos 3D

### Estatua Dorada (estatua.glb)
- **Ubicación**: Página de inicio
- **Formato**: GLB (optimizado para web)
- **Características**:
  - Rotación automática continua
  - Material dorado aplicado proceduralmente con reflejos metálicos
  - Iluminación dinámica con múltiples fuentes de luz
  - Sombras proyectadas
  - Efectos de resplandor dorado
  - Carga asíncrona con fallback procedural

### Tecnologías Utilizadas
- **Three.js**: Renderizado 3D en el navegador
- **GLTFLoader**: Cargador optimizado para modelos GLB/GLTF
- **WebGL**: Aceleración gráfica por hardware
- **Material dorado personalizado**: 
  - Metalness: 0.8
  - Roughness: 0.2
  - Color: #ffd700 (oro)
  - Aplicado proceduralmente a todas las geometrías del modelo

### Rendimiento
- Optimizado para dispositivos móviles y de escritorio
- Renderizado responsivo que se ajusta al tamaño del contenedor
- Limpieza automática de recursos al destruir el componente

## Uso en Componentes

La estatua 3D se integra en el componente `HomeComponent` utilizando el servicio `ThreeSceneService` que encapsula toda la lógica de Three.js.

```typescript
// Ejemplo de uso
this.threeSceneService.createStatueScene(containerElement);
```

## Futuras Mejoras

- Agregar más modelos 3D para diferentes secciones
- Implementar carga lazy de modelos para mejorar rendimiento
- Agregar interactividad (click, hover effects)
- Soporte para modelos más complejos (GLB/GLTF)
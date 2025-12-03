# Carpeta de Imágenes

Esta carpeta está destinada para contener:

## 📷 Tipos de Imágenes
- **Logos**: Logo principal de Reyes & Navajas
- **Iconos**: Iconos personalizados para servicios
- **Backgrounds**: Imágenes de fondo para secciones
- **Gallery**: Fotografías de la barbería y servicios
- **UI Elements**: Elementos gráficos de la interfaz

## 📐 Formatos Recomendados
- **Logos**: SVG o PNG con transparencia
- **Fotografías**: JPG o WebP para mejor compresión
- **Iconos**: SVG para escalabilidad perfecta
- **Backgrounds**: JPG o WebP en alta resolución

## 🎨 Estilo Visual
- Paleta de colores: Dorado (#d4af37), Negro, Grises
- Estilo: Elegante, masculino, profesional
- Temática: Barbería tradicional con toques modernos

## Ejemplos de Uso
```typescript
// En componentes Angular
export class Component {
  logoUrl = '/assets/images/logo.svg';
  backgroundImage = '/assets/images/barbershop-bg.jpg';
}
```

```html
<!-- En templates -->
<img src="/assets/images/service-icon.svg" alt="Servicio">
<div class="bg-cover" style="background-image: url('/assets/images/hero-bg.jpg')">
```
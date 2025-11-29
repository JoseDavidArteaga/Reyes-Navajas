import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metricas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-gray-100 mb-2">
          Mis Métricas
        </h1>
        <p class="text-gray-400">
          Resumen de tu desempeño y estadísticas
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Métricas principales -->
        <div class="card text-center">
          <div class="text-3xl font-bold text-barberia-gold mb-2">1,250</div>
          <div class="text-gray-400 text-sm">Servicios Totales</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-green-400 mb-2">4.8</div>
          <div class="text-gray-400 text-sm">Calificación Promedio</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-blue-400 mb-2">85%</div>
          <div class="text-gray-400 text-sm">Tasa de Ocupación</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-barberia-gold mb-2">$2.1M</div>
          <div class="text-gray-400 text-sm">Ingresos del Mes</div>
        </div>
      </div>

      <!-- Gráficos y estadísticas detalladas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-100 mb-4">
            Servicios por Mes
          </h2>
          <div class="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
            <p class="text-gray-400">Gráfico de servicios mensuales</p>
          </div>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold text-gray-100 mb-4">
            Ingresos Semanales
          </h2>
          <div class="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
            <p class="text-gray-400">Gráfico de ingresos semanales</p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricasComponent {}
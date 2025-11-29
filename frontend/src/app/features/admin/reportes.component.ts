import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-gray-100 mb-2">
          Reportes y Análisis
        </h1>
        <p class="text-gray-400">
          Estadísticas de ocupación, cancelaciones y rendimiento general
        </p>
      </div>

      <!-- Métricas principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card text-center">
          <div class="text-3xl font-bold text-barberia-gold mb-2">2,847</div>
          <div class="text-gray-400 text-sm">Reservas del Mes</div>
          <div class="text-green-400 text-xs mt-1">+12% vs mes anterior</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-green-400 mb-2">89%</div>
          <div class="text-gray-400 text-sm">Tasa de Ocupación</div>
          <div class="text-green-400 text-xs mt-1">+5% vs mes anterior</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-red-400 mb-2">8%</div>
          <div class="text-gray-400 text-sm">Tasa de Cancelación</div>
          <div class="text-red-400 text-xs mt-1">+2% vs mes anterior</div>
        </div>
        
        <div class="card text-center">
          <div class="text-3xl font-bold text-barberia-gold mb-2">$8.2M</div>
          <div class="text-gray-400 text-sm">Ingresos del Mes</div>
          <div class="text-green-400 text-xs mt-1">+18% vs mes anterior</div>
        </div>
      </div>

      <!-- Gráficos y análisis -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Ocupación por barbero -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-100 mb-4">
            Ocupación por Barbero
          </h2>
          <div class="space-y-3">
            @for (barbero of ocupacionBarberos; track barbero.nombre) {
              <div class="flex items-center justify-between">
                <span class="text-gray-300">{{ barbero.nombre }}</span>
                <div class="flex items-center space-x-3">
                  <div class="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-barberia-gold h-2 rounded-full"
                      [style.width]="barbero.ocupacion + '%'">
                    </div>
                  </div>
                  <span class="text-barberia-gold font-medium w-12">
                    {{ barbero.ocupacion }}%
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Servicios más populares -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-100 mb-4">
            Servicios Más Populares
          </h2>
          <div class="space-y-3">
            @for (servicio of serviciosPopulares; track servicio.nombre) {
              <div class="flex items-center justify-between">
                <span class="text-gray-300">{{ servicio.nombre }}</span>
                <div class="flex items-center space-x-3">
                  <div class="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-blue-400 h-2 rounded-full"
                      [style.width]="(servicio.cantidad / maxServicios * 100) + '%'">
                    </div>
                  </div>
                  <span class="text-blue-400 font-medium w-12">
                    {{ servicio.cantidad }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Tabla de cancelaciones -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-100 mb-4">
          Análisis de Cancelaciones
        </h2>
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">Motivo</th>
                <th class="table-header-cell">Cantidad</th>
                <th class="table-header-cell">Porcentaje</th>
                <th class="table-header-cell">Tendencia</th>
              </tr>
            </thead>
            <tbody class="table-body">
              @for (motivo of motivosCancelacion; track motivo.motivo) {
                <tr>
                  <td class="table-cell">{{ motivo.motivo }}</td>
                  <td class="table-cell">{{ motivo.cantidad }}</td>
                  <td class="table-cell">{{ motivo.porcentaje }}%</td>
                  <td class="table-cell">
                    <span [class]="getTendenciaClass(motivo.tendencia)">
                      {{ motivo.tendencia > 0 ? '+' : '' }}{{ motivo.tendencia }}%
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Gráficos adicionales -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-100 mb-4">
            Ingresos por Día
          </h2>
          <div class="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
            <p class="text-gray-400">Gráfico de ingresos diarios</p>
          </div>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold text-gray-100 mb-4">
            Reservas por Hora
          </h2>
          <div class="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
            <p class="text-gray-400">Gráfico de distribución horaria</p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportesComponent {
  ocupacionBarberos = [
    { nombre: 'Carlos Rodríguez', ocupacion: 92 },
    { nombre: 'Miguel Torres', ocupacion: 85 },
    { nombre: 'Juan Pérez', ocupacion: 78 },
    { nombre: 'Luis García', ocupacion: 88 }
  ];

  serviciosPopulares = [
    { nombre: 'Corte Clásico', cantidad: 450 },
    { nombre: 'Corte y Barba', cantidad: 320 },
    { nombre: 'Corte Moderno', cantidad: 280 },
    { nombre: 'Afeitado Clásico', cantidad: 150 },
    { nombre: 'Arreglo de Barba', cantidad: 120 }
  ];

  maxServicios = Math.max(...this.serviciosPopulares.map(s => s.cantidad));

  motivosCancelacion = [
    { motivo: 'Emergencia personal', cantidad: 45, porcentaje: 35, tendencia: -2 },
    { motivo: 'Cambio de horario', cantidad: 32, porcentaje: 25, tendencia: +5 },
    { motivo: 'Enfermedad', cantidad: 28, porcentaje: 22, tendencia: -1 },
    { motivo: 'Trabajo imprevisto', cantidad: 15, porcentaje: 12, tendencia: +3 },
    { motivo: 'Otros', cantidad: 8, porcentaje: 6, tendencia: 0 }
  ];

  getTendenciaClass(tendencia: number): string {
    if (tendencia > 0) {
      return 'text-red-400';
    } else if (tendencia < 0) {
      return 'text-green-400';
    } else {
      return 'text-gray-400';
    }
  }
}
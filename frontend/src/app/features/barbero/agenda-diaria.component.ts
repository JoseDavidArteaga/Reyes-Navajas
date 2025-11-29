import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService, AuthService } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';

@Component({
  selector: 'app-agenda-diaria',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-gray-100 mb-2">
          Agenda del Día
        </h1>
        <p class="text-gray-400">
          {{ currentDate | date:'fullDate':'es' }}
        </p>
      </div>

      @if (reservaService.isLoading()) {
        <app-loading-spinner message="Cargando agenda..."></app-loading-spinner>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Lista de citas -->
          <div class="lg:col-span-2">
            <div class="card">
              <h2 class="text-xl font-semibold text-gray-100 mb-4">
                Citas de Hoy
              </h2>
              
              <div class="space-y-3">
                @for (reserva of citasDelDia; track reserva.id) {
                  <div class="bg-gray-900 rounded-lg p-4 border-l-4" 
                       [class]="getBorderClass(reserva.estado)">
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="text-lg font-medium text-gray-100">
                          {{ reserva.cliente?.nombre }}
                        </h3>
                        <p class="text-gray-400">{{ reserva.servicio?.nombre }}</p>
                        <p class="text-sm text-gray-500">
                          {{ reserva.fechaHora | date:'shortTime' }} - 
                          {{ reserva.servicio?.duracion }} min
                        </p>
                        @if (reserva.notas) {
                          <p class="text-xs text-gray-400 mt-1">
                            Nota: {{ reserva.notas }}
                          </p>
                        }
                      </div>
                      <div class="text-right">
                        <span [class]="getBadgeClass(reserva.estado)">
                          {{ getEstadoText(reserva.estado) }}
                        </span>
                        <div class="mt-2 space-x-2">
                          @if (reserva.estado === 'CONFIRMADA') {
                            <button 
                              (click)="iniciarServicio(reserva.id)"
                              class="btn-primary text-xs px-3 py-1">
                              Iniciar
                            </button>
                          }
                          @if (reserva.estado === 'EN_PROGRESO') {
                            <button 
                              (click)="finalizarServicio(reserva.id)"
                              class="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded">
                              Finalizar
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-8">
                    <div class="text-6xl mb-4 opacity-50">📅</div>
                    <p class="text-gray-400">
                      No tienes citas programadas para hoy
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Panel de resumen -->
          <div class="space-y-6">
            <!-- Estadísticas del día -->
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-100 mb-4">
                Resumen del Día
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-400">Total citas:</span>
                  <span class="text-gray-100 font-medium">{{ citasDelDia.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Completadas:</span>
                  <span class="text-green-400 font-medium">{{ getCitasCompletadas() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Pendientes:</span>
                  <span class="text-yellow-400 font-medium">{{ getCitasPendientes() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Ingresos estimados:</span>
                  <span class="text-barberia-gold font-medium">
                    \${{ getIngresosEstimados() | number }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Próxima cita -->
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-100 mb-4">
                Próxima Cita
              </h3>
              @if (proximaCita) {
                <div class="text-center">
                  <div class="text-2xl font-bold text-barberia-gold mb-2">
                    {{ proximaCita.fechaHora | date:'shortTime' }}
                  </div>
                  <div class="text-gray-100 font-medium">
                    {{ proximaCita.cliente?.nombre }}
                  </div>
                  <div class="text-gray-400">
                    {{ proximaCita.servicio?.nombre }}
                  </div>
                  <div class="text-xs text-gray-500 mt-2">
                    {{ proximaCita.servicio?.duracion }} minutos
                  </div>
                </div>
              } @else {
                <div class="text-center text-gray-400">
                  No hay más citas hoy
                </div>
              }
            </div>

            <!-- Acciones rápidas -->
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-100 mb-4">
                Acciones Rápidas
              </h3>
              <div class="space-y-3">
                <button class="w-full btn-primary">
                  Ver Cola Virtual
                </button>
                <button class="w-full btn-secondary">
                  Marcar Descanso
                </button>
                <button class="w-full btn-secondary">
                  Ver Métricas
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaDiariaComponent implements OnInit {
  currentDate = new Date();
  citasDelDia: any[] = [];
  proximaCita: any = null;

  constructor(
    public reservaService: ReservaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAgenda();
  }

  loadAgenda(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.reservaService.getReservasByBarbero(currentUser.id, this.currentDate).subscribe(response => {
        if (response.success) {
          this.citasDelDia = response.data.sort((a, b) => 
            new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
          );
          this.setProximaCita();
        }
      });
    }
  }

  iniciarServicio(reservaId: string): void {
    this.reservaService.iniciarServicio(reservaId).subscribe(() => {
      this.loadAgenda();
    });
  }

  finalizarServicio(reservaId: string): void {
    this.reservaService.finalizarServicio(reservaId).subscribe(() => {
      this.loadAgenda();
    });
  }

  getBorderClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA': return 'border-blue-500';
      case 'EN_PROGRESO': return 'border-green-500';
      case 'FINALIZADA': return 'border-gray-500';
      default: return 'border-yellow-500';
    }
  }

  getBadgeClass(estado: string): string {
    const baseClass = 'badge ';
    switch (estado) {
      case 'CONFIRMADA': return baseClass + 'badge-info';
      case 'EN_PROGRESO': return baseClass + 'badge-success';
      case 'FINALIZADA': return baseClass + 'badge-success';
      default: return baseClass + 'badge-warning';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA': return 'Confirmada';
      case 'EN_PROGRESO': return 'En Progreso';
      case 'FINALIZADA': return 'Finalizada';
      default: return estado;
    }
  }

  getCitasCompletadas(): number {
    return this.citasDelDia.filter(c => c.estado === 'FINALIZADA').length;
  }

  getCitasPendientes(): number {
    return this.citasDelDia.filter(c => ['CONFIRMADA', 'EN_PROGRESO'].includes(c.estado)).length;
  }

  getIngresosEstimados(): number {
    return this.citasDelDia
      .filter(c => c.estado !== 'CANCELADA')
      .reduce((total, cita) => total + (cita.servicio?.precio || 0), 0);
  }

  private setProximaCita(): void {
    const now = new Date();
    this.proximaCita = this.citasDelDia.find(cita => 
      new Date(cita.fechaHora) > now && ['CONFIRMADA', 'PENDIENTE'].includes(cita.estado)
    );
  }
}
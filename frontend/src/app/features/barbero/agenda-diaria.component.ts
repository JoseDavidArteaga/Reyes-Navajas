import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ReservaService, AuthService, Reserva, EstadoReserva} from '../../core';
import {UserService} from '../../core/services/user.service';
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

      @if (isLoading) {
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
                      <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-100">
                          Cliente #{{ reserva.clienteId }}
                        </h3>
                        <p class="text-gray-400">Servicio #{{ reserva.servicioId }}</p>
                        <p class="text-sm text-gray-500">
                          {{ reserva.fechaHora | date:'shortTime' }} - 
                          {{ reserva.duracionMinutos }} min
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
                        
                        <!-- Botones según el estado -->
                        <div class="mt-2 flex flex-wrap gap-2 justify-end">

  <!-- 1. ESTADO: PENDIENTE -->
  @if (reserva.estado === 'PENDIENTE') {
    <button 
      (click)="confirmarReserva(reserva.id)"
      class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded">
      Confirmar
    </button>

    <button 
      (click)="iniciarServicio(reserva.id)"
      class="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded">
      ▶Iniciar
    </button>

    <button 
      (click)="cancelarReserva(reserva.id)"
      class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded">
      Cancelar
    </button>
  }

  <!-- 2. ESTADO: CONFIRMADO -->
  @if (reserva.estado === 'CONFIRMADO') {
    <button 
      (click)="iniciarServicio(reserva.id)"
      class="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded">
      Iniciar
    </button>

    <button 
      (click)="cancelarReserva(reserva.id)"
      class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded">
      Cancelar
    </button>

    <button 
      (click)="marcarNoAsistio(reserva.id)"
      class="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 rounded">
       No asistió
    </button>
  }

  <!-- 3. ESTADO: EN_PROCESO -->
  @if (reserva.estado === 'EN_PROCESO') {
    <button 
      (click)="finalizarServicio(reserva.id)"
      class="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded">
      Finalizar
    </button>
  }

  <!-- 4. ESTADOS QUE YA NO PERMITEN ACCIONES -->
  @if (
    reserva.estado === 'FINALIZADO' ||
    reserva.estado === 'CANCELADO' ||
    reserva.estado === 'NO_ASISTIO'
  ) {
    <span class="text-xs text-gray-500 italic">
      Sin acciones
    </span>
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
                  <span class="text-gray-400">Canceladas:</span>
                  <span class="text-red-400 font-medium">{{ getCitasCanceladas() }}</span>
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
                    Cliente #{{ proximaCita.clienteId }}
                  </div>
                  <div class="text-gray-400">
                    Servicio #{{ proximaCita.servicioId }}
                  </div>
                  <div class="text-xs text-gray-500 mt-2">
                    {{ proximaCita.duracionMinutos }} minutos
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
  `
})
export class AgendaDiariaComponent implements OnInit {
  currentDate = new Date();
  citasDelDia: any[] = [];
  proximaCita: any | null = null;
  isLoading: boolean = true;

  constructor(
    public reservaService: ReservaService,
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAgenda();
  }

  loadAgenda(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    const currentUser = this.authService.currentUser();
    console.log(`[AgendaDiariaComponent] Usuario actual:`, currentUser);
    
    if (currentUser && currentUser.nombre) {
      this.userService.getUserIdByUsername(currentUser.nombre).subscribe({
        next: (userId: string) => {
          console.log(`[AgendaDiariaComponent] ID del usuario:`, userId);
          this.reservaService.getReservasByBarbero(userId, this.currentDate).subscribe({
            next: (response) => {
              console.log('[AgendaDiariaComponent] Respuesta recibida:', response);
              
              // Manejar diferentes formatos de respuesta
              let reservas: any[] = [];
              if (Array.isArray(response)) {
                reservas = response;
              } else if (response?.success && response?.data) {
                reservas = Array.isArray(response.data) ? response.data : [response.data];
              } else if (response?.data) {
                reservas = Array.isArray(response.data) ? response.data : [response.data];
              }
              
              if (reservas.length > 0) {
                this.citasDelDia = reservas.sort((a, b) => 
                  new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
                );
                this.setProximaCita();
              } else {
                this.citasDelDia = [];
                this.proximaCita = null;
              }
              
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('[AgendaDiariaComponent] Error al cargar reservas:', err);
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => {
          console.error('[AgendaDiariaComponent] Error al obtener ID de usuario:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      console.warn('[AgendaDiariaComponent] No hay usuario actual o falta nombre');
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Código activo - flujo simplificado
  iniciarServicio(reservaId: string): void {
    console.log('[AgendaDiariaComponent] Iniciando servicio:', reservaId);
    this.reservaService.iniciarServicio(reservaId).subscribe({
      next: () => {
        console.log('[AgendaDiariaComponent] Servicio iniciado exitosamente');
        this.loadAgenda();
      },
      error: (err) => {
        console.error('[AgendaDiariaComponent] Error al iniciar servicio:', err);
      }
    });
  }
  
  finalizarServicio(reservaId: string): void {
    console.log('[AgendaDiariaComponent] Finalizando servicio:', reservaId);
    this.reservaService.finalizarServicio(reservaId).subscribe({
      next: () => {
        console.log('[AgendaDiariaComponent] Servicio finalizado exitosamente');
        this.loadAgenda();
      },
      error: (err) => {
        console.error('[AgendaDiariaComponent] Error al finalizar servicio:', err);
      }
    });
  }

  cancelarReserva(reservaId: string): void {
    console.log('[AgendaDiariaComponent] Cancelando reserva:', reservaId);
    this.reservaService.cancelarReserva(reservaId).subscribe({
      next: () => {
        console.log('[AgendaDiariaComponent] Reserva cancelada exitosamente');
        this.loadAgenda();
      },
      error: (err) => {
        console.error('[AgendaDiariaComponent] Error al cancelar reserva:', err);
      }
    });
  }

  // Código mantenido pero no usado en el flujo simplificado
  confirmarReserva(reservaId: string): void {
    console.log('[AgendaDiariaComponent] Confirmando reserva:', reservaId);
    this.reservaService.confirmarReserva(reservaId).subscribe({
      next: () => {
        console.log('[AgendaDiariaComponent] Reserva confirmada exitosamente');
        this.loadAgenda();
      },
      error: (err) => {
        console.error('[AgendaDiariaComponent] Error al confirmar reserva:', err);
      }
    });
  }

  marcarNoAsistio(reservaId: string): void {
    console.log('[AgendaDiariaComponent] Marcando como no asistió:', reservaId);
    this.reservaService.marcarNoAsistio(reservaId).subscribe({
      next: () => {
        console.log('[AgendaDiariaComponent] Marcado como no asistió exitosamente');
        this.loadAgenda();
      },
      error: (err) => {
        console.error('[AgendaDiariaComponent] Error al marcar no asistió:', err);
      }
    });
  }

  getBorderClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA': return 'border-blue-500';
      case 'EN_PROGRESO': return 'border-green-500';
      case 'FINALIZADA': return 'border-purple-500';
      case 'PENDIENTE': return 'border-yellow-500';
      case 'CANCELADA': return 'border-red-500';
      case 'NO_ASISTIO': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  }

  getBadgeClass(estado: string): string {
    const baseClass = 'badge ';
    switch (estado) {
      case 'CONFIRMADA': return baseClass + 'badge-info';
      case 'EN_PROGRESO': return baseClass + 'badge-success';
      case 'FINALIZADA': return baseClass + 'bg-purple-500/20 text-purple-400';
      case 'PENDIENTE': return baseClass + 'badge-warning';
      case 'CANCELADA': return baseClass + 'badge-error';
      case 'NO_ASISTIO': return baseClass + 'bg-orange-500/20 text-orange-400';
      default: return baseClass + 'badge-warning';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA': return 'Confirmada';
      case 'EN_PROGRESO': return 'En Progreso';
      case 'FINALIZADA': return 'Finalizada';
      case 'PENDIENTE': return 'Pendiente';
      case 'CANCELADA': return 'Cancelada';
      case 'NO_ASISTIO': return 'No Asistió';
      default: return estado;
    }
  }

  getCitasCompletadas(): number {
    return this.citasDelDia.filter(c => c.estado === 'FINALIZADA').length;
  }

  getCitasPendientes(): number {
    return this.citasDelDia.filter(c => ['EN_PROGRESO', 'PENDIENTE'].includes(c.estado)).length;
  }

  getCitasCanceladas(): number {
    return this.citasDelDia.filter(c => c.estado === 'CANCELADA').length;
  }

  getCitasNoAsistio(): number {
    return this.citasDelDia.filter(c => c.estado === 'NO_ASISTIO').length;
  }

  private setProximaCita(): void {
    const now = new Date();
    this.proximaCita = this.citasDelDia.find(cita => 
      new Date(cita.fechaHora) > now && ['PENDIENTE', 'EN_PROGRESO'].includes(cita.estado)
    ) || null;
  }
}
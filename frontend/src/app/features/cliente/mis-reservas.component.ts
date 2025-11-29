import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService, AuthService } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-gray-100 mb-2">
          Mis Reservas
        </h1>
        <p class="text-gray-400">
          Gestiona tus citas y revisa tu historial
        </p>
      </div>

      @if (reservaService.isLoading()) {
        <app-loading-spinner message="Cargando reservas..."></app-loading-spinner>
      } @else {
        <div class="space-y-6">
          <!-- Reservas próximas -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-100 mb-4">Próximas Citas</h2>
            <div class="space-y-4">
              @for (reserva of reservasProximas; track reserva.id) {
                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="text-lg font-medium text-gray-100">{{ reserva.servicio?.nombre }}</h3>
                      <p class="text-gray-400">Barbero: {{ reserva.barbero?.nombre }}</p>
                      <p class="text-gray-400">{{ formatDate(reserva.fechaHora) }}</p>
                    </div>
                    <div class="text-right">
                      <span class="badge badge-success">{{ reserva.estado }}</span>
                      <p class="text-barberia-gold font-semibold mt-2">\${{ reserva.servicio?.precio | number }}</p>
                    </div>
                  </div>
                </div>
              } @empty {
                <p class="text-gray-400 text-center py-8">No tienes citas próximas</p>
              }
            </div>
          </div>

          <!-- Historial -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-100 mb-4">Historial</h2>
            <div class="space-y-4">
              @for (reserva of historialReservas; track reserva.id) {
                <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="text-lg font-medium text-gray-100">{{ reserva.servicio?.nombre }}</h3>
                      <p class="text-gray-400">Barbero: {{ reserva.barbero?.nombre }}</p>
                      <p class="text-gray-400">{{ formatDate(reserva.fechaHora) }}</p>
                    </div>
                    <div class="text-right">
                      <span [class]="getBadgeClass(reserva.estado)">{{ reserva.estado }}</span>
                      <p class="text-barberia-gold font-semibold mt-2">\${{ reserva.servicio?.precio | number }}</p>
                    </div>
                  </div>
                </div>
              } @empty {
                <p class="text-gray-400 text-center py-8">No tienes historial de reservas</p>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisReservasComponent implements OnInit {
  reservasProximas: any[] = [];
  historialReservas: any[] = [];

  constructor(
    public reservaService: ReservaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReservas();
  }

  loadReservas(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.reservaService.getReservasByCliente(currentUser.id).subscribe(response => {
        if (response.success) {
          const today = new Date();
          this.reservasProximas = response.data.filter(r => 
            r.fechaHora >= today && ['PENDIENTE', 'CONFIRMADA'].includes(r.estado)
          );
          this.historialReservas = response.data.filter(r => 
            r.fechaHora < today || ['CANCELADA', 'FINALIZADA'].includes(r.estado)
          );
        }
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getBadgeClass(estado: string): string {
    const baseClass = 'badge ';
    switch (estado) {
      case 'CONFIRMADA':
        return baseClass + 'badge-success';
      case 'PENDIENTE':
        return baseClass + 'badge-warning';
      case 'CANCELADA':
        return baseClass + 'badge-danger';
      case 'FINALIZADA':
        return baseClass + 'badge-info';
      default:
        return baseClass + 'badge-info';
    }
  }
}
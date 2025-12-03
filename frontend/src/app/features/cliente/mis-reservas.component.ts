import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService, AuthService } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './mis-reservas.component.html',
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
    if (!currentUser) return;

    this.reservaService.getReservasByCliente(currentUser.id).subscribe(resp => {
      if (!resp.success) return;

      const today = new Date();

      const reservas = resp.data.map(r => ({
        ...r,
        fechaHora: new Date(r.fechaHora)
      }));

      this.reservasProximas = reservas.filter(r =>
        r.fechaHora >= today &&
        ['PENDIENTE', 'CONFIRMADA'].includes(r.estado)
      );

      this.historialReservas = reservas.filter(r =>
        r.fechaHora < today ||
        ['CANCELADA', 'FINALIZADA'].includes(r.estado)
      );
    });
  }

  confirmarReserva(id: string) {
    this.reservaService.confirmarReserva(id).subscribe(() => this.loadReservas());
  }

  cancelarReserva(id: string) {
    this.reservaService.cancelarReserva(id).subscribe(() => this.loadReservas());
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getBadgeClass(estado: string): string {
    const base = 'badge ';
    return {
      'CONFIRMADA': base + 'badge-success',
      'PENDIENTE': base + 'badge-warning',
      'CANCELADA': base + 'badge-danger',
      'FINALIZADA': base + 'badge-info'
    }[estado] ?? base + 'badge-info';
  }
}

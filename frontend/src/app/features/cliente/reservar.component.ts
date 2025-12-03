import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServicioService, BarberoService, ReservaService, AuthService } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './reservar.component.html',
  styleUrls: ['./reservar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservarComponent {

  private readonly servicioService = inject(ServicioService);
  private readonly barberoService = inject(BarberoService);
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  servicios = this.servicioService.servicios;
  barberos = this.barberoService.barberos;
  isLoading = this.servicioService.isLoading;

  currentStep = signal(1);
  selectedService = signal<any>(null);
  selectedBarbero = signal<any>(null);
  selectedTime = signal<string>('');

  barberosDisponibles = signal<any[]>([]);
  horasDisponibles = signal<string[]>([]);
  availableHours = signal<Set<string>>(new Set());
  hasAvailabilityData = signal<boolean>(false);

  minDate: string;
  maxDate: string;

  reservaForm: FormGroup;

  constructor() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const max = new Date();
    max.setDate(today.getDate() + 30);
    this.maxDate = max.toISOString().split('T')[0];

    this.reservaForm = this.fb.group({
      servicio: ['', Validators.required],
      barbero: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      notas: ['']
    });

    this.servicioService.getAllServicios().subscribe();
    this.barberoService.getAllBarberos().subscribe();
  }

  selectService(servicio: any): void {
    this.selectedService.set(servicio);
    this.reservaForm.patchValue({ servicio: servicio.id });

    this.barberoService.getAllBarberos().subscribe({
      next: (resp: any) => {
        const data = resp?.data ?? resp;
        this.barberosDisponibles.set(data);
      },
      error: (err: any) => {
        console.warn('Error obteniendo barberos:', err);
        this.barberosDisponibles.set(this.barberos());
      }
    });

    if (this.currentStep() === 1) this.nextStep();
  }

  selectBarbero(barbero: any): void {
    this.selectedBarbero.set(barbero);
    this.reservaForm.patchValue({ barbero: barbero.id });
    this.loadDisponibilidadBarbero();

    if (this.currentStep() === 2) this.nextStep();
  }

  selectTime(hora: string): void {
    this.selectedTime.set(hora);
    this.reservaForm.patchValue({ hora });
  }

  onFechaChange(): void {
    if (this.selectedBarbero()) {
      this.loadDisponibilidadBarbero();
    }
  }

  private loadDisponibilidadBarbero(): void {
  if (!this.selectedBarbero()) return;

  const fechaStr =
    this.reservaForm.get('fecha')?.value ||
    new Date().toISOString().split('T')[0];

  this.reservaService
    .getDisponibilidadBarbero(this.selectedBarbero().id, new Date(fechaStr), 1)
    .subscribe({
      next: (resp) => {
        const horas = this.reservaService.mapHorasDisponiblesPorFecha(
          resp.data ?? resp,
          fechaStr
        );

        if (horas && horas.length > 0) {
          this.availableHours.set(new Set(horas));
          this.hasAvailabilityData.set(true);
        } else {
          this.availableHours.set(new Set());
          this.hasAvailabilityData.set(false);
        }

        this.generateHorasDisponibles();
      },
      error: (err) => {
        console.warn('Error obteniendo disponibilidad del barbero:', err);
        this.availableHours.set(new Set());
        this.hasAvailabilityData.set(false);
        this.generateHorasDisponibles();
      }
    });
}



  nextStep(): void {
    if (this.isStepValid(this.currentStep())) {
      this.currentStep.set(this.currentStep() + 1);
      if (this.currentStep() === 3) {
        this.generateHorasDisponibles();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  isStepValid(step: number): boolean {
    return {
      1: !!this.selectedService(),
      2: !!this.selectedBarbero(),
      3: this.reservaForm.get('fecha')?.valid && this.reservaForm.get('hora')?.valid
    }[step] ?? true;
  }

  generateHorasDisponibles(): void {
    const horas: string[] = [];
    for (let i = 9; i < 18; i++) {
      horas.push(`${i.toString().padStart(2, '0')}:00`);
      horas.push(`${i.toString().padStart(2, '0')}:30`);
    }
    this.horasDisponibles.set(horas);
  }

  isTimeAvailable(hora: string): boolean {
    const set = this.availableHours();
    if (!this.hasAvailabilityData()) return true;
    return set.has(hora);
  }

  getSelectedServicePrice(): number {
    return this.selectedService()?.precio || 0;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  onSubmit(): void {
    if (!this.reservaForm.valid) return;

    const fecha = this.reservaForm.get('fecha')?.value;
    const hora = this.reservaForm.get('hora')?.value;

    const fechaHora = `${fecha}T${hora}:00`;

    const data = {
      clienteId: this.authService.currentUser()?.id,
      servicioId: this.selectedService()?.id,
      barberoId: this.selectedBarbero()?.id,
      fechaHora,
      notas: this.reservaForm.get('notas')?.value || '',
      duracionMinutos: this.selectedService()?.duracion
    };

    this.reservaService.createReserva(data).subscribe({
      next: (resp: any) => {
        if (resp?.success) {
          this.toastr.success('Reserva creada correctamente');
        }
      },
      error: (err: any) => {
        const msg = err?.error?.message || err?.message || 'Error de conexión';
        this.toastr.error(msg, 'Error');
      }
    });
  }

  trackByServicioId(_: number, s: any) { return s.id; }
  trackByBarberoId(_: number, b: any) { return b.id; }
  trackByHora(_: number, h: string) { return h; }
  trackByIndex(i: number) { return i; }
}

import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServicioService, BarberoService, ReservaService } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';

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
  private readonly fb = inject(FormBuilder);

  servicios = this.servicioService.servicios;
  barberos = this.barberoService.barberos;
  isLoading = this.servicioService.isLoading;

  currentStep = signal(1);
  selectedService = signal<any>(null);
  selectedBarbero = signal<any>(null);
  selectedTime = signal<string>('');

  barberosDisponibles = signal<any[]>([]);
  horasDisponibles = signal<string[]>([]);

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

    const filtrados = this.barberos().filter(b =>
      b.especialidades?.some((e: string) =>
        e.toLowerCase().includes(servicio.categoria?.toLowerCase() || '')
      )
    );

    this.barberosDisponibles.set(filtrados);

    if (this.currentStep() === 1) this.nextStep();
  }

  selectBarbero(barbero: any): void {
    this.selectedBarbero.set(barbero);
    this.reservaForm.patchValue({ barbero: barbero.id });

    if (this.currentStep() === 2) this.nextStep();
  }

  selectTime(hora: string): void {
    this.selectedTime.set(hora);
    this.reservaForm.patchValue({ hora });
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
    return true;
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
    if (this.reservaForm.valid) {
      const data = {
        servicioId: this.selectedService()?.id,
        barberoId: this.selectedBarbero()?.id,
        fechaHora: `${this.reservaForm.get('fecha')?.value}T${this.reservaForm.get('hora')?.value}`,
        notas: this.reservaForm.get('notas')?.value || ''
      };

      this.reservaService.createReserva(data).subscribe({
        next: resp => console.log('Reserva creada', resp),
        error: err => console.error('Error', err)
      });
    }
  }

  trackByServicioId(_: number, s: any) { return s.id; }
  trackByBarberoId(_: number, b: any) { return b.id; }
  trackByHora(_: number, h: string) { return h; }
  trackByIndex(i: number) { return i; }
}

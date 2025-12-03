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
  private readonly barberoService = inject(BarberoService); // Se mantiene inyectado por si es útil en el futuro
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  servicios = this.servicioService.servicios;
  // ELIMINADA: barberos = this.barberoService.barberos; 
  isLoading = this.reservaService.isLoading; // Usamos el isLoading del servicio de reservas

  currentStep = signal(1);
  selectedService = signal<any>(null); // Idealmente tipado como Servicio
  selectedBarbero = signal<any>(null); // Idealmente tipado como Barbero
  selectedTime = signal<string>('');

  barberosDisponibles = signal<any[]>([]); // Idealmente tipado como Barbero[]
  horasDisponibles = signal<string[]>([]);
  availableHours = signal<Set<string>>(new Set());
  hasAvailabilityData = signal<boolean>(false);

  minDate: string;
  maxDate: string;

  reservaForm: FormGroup;

  constructor() {
    const today = new Date();
    // Obtener la fecha mínima para el calendario (hoy)
    this.minDate = today.toISOString().split('T')[0];

    // Obtener la fecha máxima para el calendario (30 días en el futuro)
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

    // 1. Cargar servicios al iniciar
    this.servicioService.getAllServicios().subscribe();
    // ELIMINADO: this.reservaService.getBarberosByServicio().subscribe(); // Innecesario en el constructor

    // 2. Escuchar cambios en la fecha para actualizar horas disponibles
    this.reservaForm.get('fecha')?.valueChanges.subscribe(fecha => {
      if (fecha && this.selectedBarbero()) {
        // Reiniciar la hora si la fecha cambia y hay un barbero seleccionado
        this.reservaForm.patchValue({ hora: '' });
        this.selectedTime.set('');
        this.cargarHorasDisponibles();
      }
    });
  }

  // --- Lógica de Pasos y Selección ---

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
    // Valida que el dato clave para cada paso esté seleccionado
    return {
      1: !!this.selectedService(),
      2: !!this.selectedBarbero(),
      3: this.reservaForm.get('fecha')?.valid && this.reservaForm.get('hora')?.valid
    }[step] ?? true;
  }

  // --- Lógica de Disponibilidad ---

  // En ReservarComponent

// En ReservarComponent

private cargarHorasDisponibles(): void {
  const barberoId = this.selectedBarbero()?.id;

const fechaCruda = this.reservaForm.get('fecha')?.value;
if (!barberoId || !fechaCruda) {
  this.horasDisponibles.set([]);
  return;
}

// Parsear como fecha LOCAL (no UTC)
const [year, month, day] = fechaCruda.split('-').map(Number);
const fechaStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  console.log("Cargando horas para barberoId:", barberoId, "en fecha:", fechaStr);
  this.reservaService.getDisponibilidadBarbero(barberoId, fechaStr).subscribe({
    next: (response: any) => {
      if (response.success && response.data) {
        const horarios = response.data.horarios ?? [];
console.log("Fecha enviada:", fechaStr);
console.log("Horarios:", response.data.horarios);


        const horarioDelDia = horarios.find(
          (h: any) => h.fecha === fechaStr
        );

        if (horarioDelDia?.horasDisponibles) {
          this.horasDisponibles.set(horarioDelDia.horasDisponibles);
        } else {
          this.horasDisponibles.set([]);
        }
      } else {
        this.horasDisponibles.set([]);
      }
    },
    error: (err) => {
      console.error('Error al cargar horas disponibles:', err);
      this.horasDisponibles.set([]);
    }
  });
}

  isTimeAvailable(hora: string): boolean {
    const set = this.availableHours();
    if (!this.hasAvailabilityData()) return true;
    return set.has(hora);
  }

  // --- Lógica de Finalización ---
  
  getSelectedServicePrice(): number {
    return this.selectedService()?.precio || 0;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

selectBarbero(barbero: any) {
  // ... tu lógica actual para seleccionar barbero
  this.selectedBarbero.set(barbero);
  
  // Si ya hay fecha seleccionada, cargar horas
  if (this.reservaForm.get('fecha')?.value) {
    this.cargarHorasDisponibles();
  }
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

  // --- Funciones Auxiliares ---
  
  trackByServicioId(_: number, s: any) { return s.id; }
  trackByBarberoId(_: number, b: any) { return b.id; }
  trackByHora(_: number, h: string) { return h; }
  trackByIndex(i: number) { return i; }
}
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServicioService, BarberoService, ReservaService } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';
// Nota: Aquí podrías necesitar importar la interfaz Barbero si usas selectedBarbero/barberosDisponibles
// con un tipado estricto en lugar de <any>.

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
  private readonly fb = inject(FormBuilder);

  servicios = this.servicioService.servicios;
  // ELIMINADA: barberos = this.barberoService.barberos; 
  isLoading = this.reservaService.isLoading; // Usamos el isLoading del servicio de reservas

  currentStep = signal(1);
  selectedService = signal<any>(null); // Idealmente tipado como Servicio
  selectedBarbero = signal<any>(null); // Idealmente tipado como Barbero
  selectedTime = signal<string>('');

  barberosDisponibles = signal<any[]>([]); // Idealmente tipado como Barbero[]
  horasDisponibles = signal<string[]>([]);

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

    // Consultar **TODOS** los barberos (como se solicitó)
    // Se asume que el método getBarberosByServicio() en ReservaService ahora devuelve TODOS los barberos.
    this.reservaService.getBarberosByServicio().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.barberosDisponibles.set(response.data);
        } else {
          this.barberosDisponibles.set([]);
        }
      },
      error: () => {
        this.barberosDisponibles.set([]);
      }
    });
    console.log('Barberos disponibles cargados:', this.barberosDisponibles());
    // Avanzar al paso 2 si estamos en el paso 1
    if (this.currentStep() === 1) this.nextStep();
  }



  selectTime(hora: string): void {
    this.selectedTime.set(hora);
    this.reservaForm.patchValue({ hora });
  }

  nextStep(): void {
    if (this.isStepValid(this.currentStep())) {
      this.currentStep.set(this.currentStep() + 1);

      // Si avanzamos al paso 3, cargamos las horas
      if (this.currentStep() === 3 && this.selectedBarbero() && this.reservaForm.get('fecha')?.value) {
        this.cargarHorasDisponibles();
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
    return this.horasDisponibles().includes(hora);
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
    if (this.reservaForm.valid) {
      // Crear el string fechaHora en formato ISO 8601 (YYYY-MM-DDTHH:MM)
      const fechaHoraISO = `${this.reservaForm.get('fecha')?.value}T${this.reservaForm.get('hora')?.value}:00`;

      const data = {
        servicioId: this.selectedService()?.id,
        barberoId: this.selectedBarbero()?.id,
        fechaHora: fechaHoraISO, 
        notas: this.reservaForm.get('notas')?.value || ''
      };

      // Llamar al método de creación en el servicio (asumiendo que acepta CreateReservaRequest)
      this.reservaService.createReserva(data).subscribe({
        next: resp => {
          console.log('Reserva creada', resp);
          // TODO: Redirigir al usuario o mostrar un mensaje de éxito.
        },
        error: err => {
          console.error('Error al crear la reserva', err);
          // TODO: Mostrar un mensaje de error al usuario.
        }
      });
    }
  }

  // --- Funciones Auxiliares ---
  
  trackByServicioId(_: number, s: any) { return s.id; }
  trackByBarberoId(_: number, b: any) { return b.id; }
  trackByHora(_: number, h: string) { return h; }
  trackByIndex(i: number) { return i; }
}
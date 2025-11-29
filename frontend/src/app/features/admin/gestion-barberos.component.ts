import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BarberoService } from '../../core';
import { EstadoBarbero } from '../../core/interfaces/barbero.interface';
import { LoadingSpinnerComponent, ModalComponent } from '../../shared';

@Component({
  selector: 'app-gestion-barberos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ModalComponent],
  templateUrl: './gestion-barberos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionBarberosComponent implements OnInit {
  showModal = signal(false);
  isEditing = signal(false);
  currentBarbero: any = null;
  barberoForm: FormGroup;

  especialidadesDisponibles = [
    'Corte Clásico',
    'Corte Moderno',
    'Barba',
    'Afeitado',
    'Degradados',
    'Diseño'
  ];

  constructor(
    private fb: FormBuilder,
    public barberoService: BarberoService
  ) {
    this.barberoForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono: [''],
      especialidades: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    // Los barberos se cargan automáticamente
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.currentBarbero = null;
    this.barberoForm.reset();
    this.showModal.set(true);
  }

  editBarbero(barbero: any): void {
    this.isEditing.set(true);
    this.currentBarbero = barbero;
    this.barberoForm.patchValue({
      nombre: barbero.nombre,
      telefono: barbero.telefono,
      especialidades: barbero.especialidades
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.currentBarbero = null;
    this.barberoForm.reset();
  }

  saveBarbero(): void {
    if (this.barberoForm.valid) {
      const barberoData = this.barberoForm.value;
      
      if (this.isEditing()) {
        this.barberoService.updateBarbero(this.currentBarbero.id, barberoData).subscribe(() => {
          this.closeModal();
        });
      } else {
        this.barberoService.createBarbero(barberoData).subscribe(() => {
          this.closeModal();
        });
      }
    }
  }

  toggleEstado(barbero: any): void {
    const nuevoEstado: EstadoBarbero = barbero.estado === 'ACTIVO' ? EstadoBarbero.INACTIVO : EstadoBarbero.ACTIVO;
    this.barberoService.cambiarEstadoBarbero(barbero.id, nuevoEstado).subscribe();
  }

  onEspecialidadChange(event: any, especialidad: string): void {
    const especialidades = this.barberoForm.get('especialidades')?.value || [];
    
    if (event.target.checked) {
      especialidades.push(especialidad);
    } else {
      const index = especialidades.indexOf(especialidad);
      if (index > -1) {
        especialidades.splice(index, 1);
      }
    }
    
    this.barberoForm.patchValue({ especialidades });
  }

  getEstadoBadgeClass(estado: string): string {
    const baseClass = 'badge ';
    switch (estado) {
      case 'ACTIVO': return baseClass + 'badge-success';
      case 'OCUPADO': return baseClass + 'badge-warning';
      case 'DESCANSO': return baseClass + 'badge-info';
      default: return baseClass + 'badge-danger';
    }
  }

  // Métodos trackBy para optimizar el rendimiento
  trackByBarberoId(index: number, barbero: any): any {
    return barbero.id;
  }

  trackByEspecialidad(index: number, especialidad: string): string {
    return especialidad;
  }
}
import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ServicioService } from '../../core';
import { LoadingSpinnerComponent, ModalComponent } from '../../shared';

@Component({
  selector: 'app-gestion-servicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ModalComponent],
  templateUrl: './gestion-servicios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionServiciosComponent implements OnInit {
  showModal = signal(false);
  isEditing = signal(false);
  currentServicio: any = null;
  servicioForm: FormGroup;

  categorias = [
    'Corte',
    'Barba',
    'Afeitado',
    'Combo',
    'Tratamiento',
    'Especial'
  ];

  constructor(
    private fb: FormBuilder,
    public servicioService: ServicioService
  ) {
    this.servicioForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      duracion: [45, [Validators.required, Validators.min(30)]],
      precio: ['', [Validators.required, Validators.min(1000)]],
      categoria: ['']
    });
  }

  ngOnInit(): void {
    // Los servicios se cargan automáticamente
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.currentServicio = null;
    this.servicioForm.reset({
      duracion: 45
    });
    this.showModal.set(true);
  }

  editServicio(servicio: any): void {
    this.isEditing.set(true);
    this.currentServicio = servicio;
    this.servicioForm.patchValue({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion: servicio.duracion,
      precio: servicio.precio,
      categoria: servicio.categoria
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.currentServicio = null;
    this.servicioForm.reset();
  }

  saveServicio(): void {
    if (this.servicioForm.valid) {
      const servicioData = this.servicioForm.value;
      
      if (this.isEditing()) {
        this.servicioService.updateServicio(this.currentServicio.id, servicioData).subscribe(() => {
          this.closeModal();
        });
      } else {
        this.servicioService.createServicio(servicioData).subscribe(() => {
          this.closeModal();
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  toggleEstado(servicio: any): void {
    const nuevoEstado = !servicio.activo;
    this.servicioService.updateServicio(servicio.id, { activo: nuevoEstado }).subscribe();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.servicioForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getStatusBadgeClass(activo: boolean): string {
    return activo ? 'badge badge-success' : 'badge badge-danger';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.servicioForm.controls).forEach(key => {
      const control = this.servicioForm.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos trackBy para optimizar el rendimiento
  trackByServicioId(index: number, servicio: any): any {
    return servicio.id;
  }

  trackByCategoria(index: number, categoria: string): string {
    return categoria;
  }
}
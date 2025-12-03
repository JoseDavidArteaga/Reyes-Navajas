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
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  defaultImageUrl = '/assets/images/default-service.svg';

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
      categoria: [''],
      imagen: [null]
    });
  }

  ngOnInit(): void {
    // Los servicios se cargan automáticamente
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.currentServicio = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.servicioForm.reset({
      duracion: 45
    });
    this.showModal.set(true);
  }

  editServicio(servicio: any): void {
    this.isEditing.set(true);
    this.currentServicio = servicio;
    this.selectedFile = null;
    this.imagePreview = servicio.imagen || null;
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
    this.selectedFile = null;
    this.imagePreview = null;
    this.servicioForm.reset();
  }

  saveServicio(): void {
    if (this.servicioForm.valid) {
      const formData = new FormData();
      const servicioData = this.servicioForm.value;
      
      // Agregar campos del formulario
      formData.append('nombre', servicioData.nombre);
      formData.append('descripcion', servicioData.descripcion);
      formData.append('duracion', servicioData.duracion.toString());
      formData.append('precio', servicioData.precio.toString());
      if (servicioData.categoria) {
        formData.append('categoria', servicioData.categoria);
      }
      
      // Agregar imagen si se seleccionó
      if (this.selectedFile) {
        formData.append('imagen', this.selectedFile);
      }
      
      if (this.isEditing()) {
        this.servicioService.updateServicioWithImage(this.currentServicio.id, formData).subscribe(() => {
          this.closeModal();
        });
      } else {
        this.servicioService.createServicioWithImage(formData).subscribe(() => {
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño de archivo (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. El tamaño máximo permitido es 2MB.');
        // Limpiar el input
        event.target.value = '';
        return;
      }
      
      // Validar tipo de archivo
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        
        // Crear preview de la imagen
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor selecciona un archivo de imagen válido.');
        // Resetear si no es una imagen válida
        this.selectedFile = null;
        this.imagePreview = null;
        event.target.value = '';
      }
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    // Resetear el input de archivo
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getImageUrl(servicio: any): string {
    return servicio.imagen || this.defaultImageUrl;
  }

  onImageError(event: any): void {
    if (event.target) {
      event.target.src = this.defaultImageUrl;
    }
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
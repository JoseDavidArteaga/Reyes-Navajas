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
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  // Confirmation modals
  showConfirmModal = signal(false);
  confirmAction = signal<'edit' | 'delete' | null>(null);
  confirmMessage = signal('');
  confirmButtonText = signal('Confirmar');
  confirmButtonType = signal<'primary' | 'danger'>('primary');

  constructor(
    private fb: FormBuilder,
    public barberoService: BarberoService
  ) {
    this.barberoForm = this.fb.group({
          nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      telefono: ['', [Validators.required, Validators.pattern(/^3\d{9}$/), Validators.minLength(10), Validators.maxLength(10)]],
          contrasenia: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/)]]
    });
  }

  ngOnInit(): void {
    // Los barberos se cargan automáticamente via loadBarberos() en el servicio
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.currentBarbero = null;
    this.barberoForm.reset();
    this.errorMessage.set(null);
    this.showModal.set(true);
  }

  editBarbero(barbero: any): void {
    this.isEditing.set(true);
    this.currentBarbero = barbero;
    this.barberoForm.patchValue({
      nombre: barbero.nombre,
      telefono: barbero.telefono,
      contrasenia: ''
    });
    this.errorMessage.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.currentBarbero = null;
    this.barberoForm.reset();
    this.errorMessage.set(null);
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
    this.confirmAction.set(null);
    this.confirmMessage.set('');
  }

  saveBarbero(): void {
    if (!this.barberoForm.valid) {
      this.markFormGroupTouched();
      return;
    }
    
    // Show confirmation modal
    if (this.isEditing()) {
      this.confirmMessage.set(`¿Estás seguro de que deseas actualizar a ${this.currentBarbero.nombre}?`);
      this.confirmAction.set('edit');
      this.confirmButtonText.set('Actualizar');
      this.confirmButtonType.set('primary');
    } else {
      this.confirmMessage.set(`¿Estás seguro de que deseas crear el barbero ${this.barberoForm.get('nombre')?.value}?`);
      this.confirmAction.set('edit');
      this.confirmButtonText.set('Crear');
      this.confirmButtonType.set('primary');
    }
    this.showConfirmModal.set(true);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.barberoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getPasswordStrengthWidth(): number {
    const password = this.barberoForm.get('contrasenia')?.value || '';
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 8) score += 25;
    if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  }

  getPasswordStrengthClass(): string {
    const width = this.getPasswordStrengthWidth();
    if (width <= 25) return 'bg-red-500';
    if (width <= 50) return 'bg-yellow-500';
    if (width <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getPasswordStrengthText(): string {
    const width = this.getPasswordStrengthWidth();
    if (width <= 25) return 'Débil';
    if (width <= 50) return 'Regular';
    if (width <= 75) return 'Buena';
    return 'Excelente';
  }

  getPasswordStrengthTextClass(): string {
    const width = this.getPasswordStrengthWidth();
    if (width <= 25) return 'text-red-400';
    if (width <= 50) return 'text-yellow-400';
    if (width <= 75) return 'text-blue-400';
    return 'text-green-400';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.barberoForm.controls).forEach(key => {
      const control = this.barberoForm.get(key);
      control?.markAsTouched();
    });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove non-digits and limit to 10 characters
    const cleaned = input.value.replace(/\D+/g, '').slice(0, 10);
    if (cleaned !== input.value) {
      input.value = cleaned;
    }
    // Update the form control without emitting another input event
    this.barberoForm.get('telefono')?.setValue(cleaned, { emitEvent: false });
  }

  deleteBarbero(barbero: any): void {
    this.confirmMessage.set(`¿Estás seguro de que deseas eliminar a ${barbero.nombre}? Esta acción no se puede deshacer.`);
    this.confirmAction.set('delete');
    this.confirmButtonText.set('Eliminar');
    this.confirmButtonType.set('danger');
    this.currentBarbero = barbero;
    this.showConfirmModal.set(true);
  }

  onConfirmAction(): void {
    const action = this.confirmAction();
    if (action === 'delete') {
      this.executeBarberoDelete();
    } else if (action === 'edit') {
      this.executeBarberoSave();
    }
  }

  private executeBarberoDelete(): void {
    if (!this.currentBarbero) return;
    
    this.barberoService.deleteBarbero(this.currentBarbero.id).subscribe({
      next: () => {
        this.successMessage.set('Barbero eliminado exitosamente');
        setTimeout(() => this.successMessage.set(null), 3000);
        this.closeConfirmModal();
      },
      error: (error) => {
        if (error.status === 403) {
          this.errorMessage.set('No tienes permiso para eliminar barberos');
        } else {
          this.errorMessage.set('Error al eliminar barbero: ' + (error.error?.message || error.message));
        }
      }
    });
  }

  private executeBarberoSave(): void {
    const barberoData = this.barberoForm.value;
    
    if (this.isEditing()) {
      this.barberoService.updateBarbero(this.currentBarbero.id, barberoData).subscribe({
        next: () => {
          this.successMessage.set('Barbero actualizado exitosamente');
          setTimeout(() => this.successMessage.set(null), 3000);
          this.closeModal();
          this.closeConfirmModal();
        },
        error: (error) => {
          if (error.status === 403) {
            this.errorMessage.set('No tienes permiso para actualizar barberos');
          } else {
            this.errorMessage.set('Error al actualizar barbero: ' + (error.error?.message || error.message));
          }
        }
      });
    } else {
      this.barberoService.createBarbero(barberoData).subscribe({
        next: () => {
          this.successMessage.set('Barbero creado exitosamente');
          setTimeout(() => this.successMessage.set(null), 3000);
          this.closeModal();
          this.closeConfirmModal();
        },
        error: (error) => {
          if (error.status === 403) {
            this.errorMessage.set('No tienes permiso para crear barberos');
          } else if (error.status === 409) {
            this.errorMessage.set('Este barbero ya existe');
          } else {
            this.errorMessage.set('Error al crear barbero: ' + (error.error?.message || error.message));
          }
        }
      });
    }
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
}
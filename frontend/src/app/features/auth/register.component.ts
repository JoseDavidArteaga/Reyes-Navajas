import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-barberia-pattern">
      <div class="max-w-md w-full space-y-8">
        <!-- Logo y título -->
        <div class="text-center">
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-barberia-gold rounded-full flex items-center justify-center">
              <span class="text-barberia-dark font-bold text-2xl">R</span>
            </div>
          </div>
          <h2 class="mt-6 text-3xl font-display font-bold text-gray-100">
            Crear Cuenta
          </h2>
          <p class="mt-2 text-sm text-gray-400">
            Únete a la familia Reyes & Navajas
          </p>
        </div>

        <!-- Formulario -->
        <div class="card">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Campo Nombre -->
            <div class="form-group">
              <label for="nombre" class="form-label">
                Nombre Completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                formControlName="nombre"
                class="form-input"
                placeholder="Tu nombre completo"
                [class.border-red-500]="isFieldInvalid('nombre')">
              
              @if (isFieldInvalid('nombre')) {
                <div class="form-error">
                  @if (registerForm.get('nombre')?.errors?.['required']) {
                    El nombre es requerido
                  }
                  @if (registerForm.get('nombre')?.errors?.['minlength']) {
                    El nombre debe tener al menos 2 caracteres
                  }
                </div>
              }
            </div>

            <!-- Campo Teléfono -->
            <div class="form-group">
              <label for="telefono" class="form-label">
                Número de Celular
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                formControlName="telefono"
                class="form-input"
                placeholder="Ej: 3001234567"
                [class.border-red-500]="isFieldInvalid('telefono')">
              
              @if (isFieldInvalid('telefono')) {
                <div class="form-error">
                  @if (registerForm.get('telefono')?.errors?.['required']) {
                    El número de celular es requerido
                  }
                  @if (registerForm.get('telefono')?.errors?.['pattern']) {
                    Ingresa un número válido (10 dígitos, iniciando con 3)
                  }
                </div>
              }
              <div class="text-xs text-gray-500 mt-1">
                Tu número será único en el sistema
              </div>
            </div>

            <!-- Campo Contraseña -->
            <div class="form-group">
              <label for="password" class="form-label">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                formControlName="password"
                class="form-input"
                placeholder="Mínimo 6 caracteres"
                [class.border-red-500]="isFieldInvalid('password')">
              
              @if (isFieldInvalid('password')) {
                <div class="form-error">
                  @if (registerForm.get('password')?.errors?.['required']) {
                    La contraseña es requerida
                  }
                  @if (registerForm.get('password')?.errors?.['minlength']) {
                    La contraseña debe tener al menos 6 caracteres
                  }
                  @if (registerForm.get('password')?.errors?.['pattern']) {
                    La contraseña debe contener al menos una letra y un número
                  }
                </div>
              }
              
              <!-- Indicador de fortaleza de contraseña -->
              @if (registerForm.get('password')?.value) {
                <div class="mt-2">
                  <div class="text-xs text-gray-500">Fortaleza de la contraseña:</div>
                  <div class="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div 
                      class="h-1 rounded-full transition-all duration-300"
                      [class]="getPasswordStrengthClass()"
                      [style.width]="getPasswordStrengthWidth() + '%'">
                    </div>
                  </div>
                  <div class="text-xs mt-1" [class]="getPasswordStrengthTextClass()">
                    {{ getPasswordStrengthText() }}
                  </div>
                </div>
              }
            </div>

            <!-- Campo Confirmar Contraseña -->
            <div class="form-group">
              <label for="confirmPassword" class="form-label">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="form-input"
                placeholder="Repite tu contraseña"
                [class.border-red-500]="isFieldInvalid('confirmPassword')">
              
              @if (isFieldInvalid('confirmPassword')) {
                <div class="form-error">
                  @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                    Confirma tu contraseña
                  }
                  @if (registerForm.get('confirmPassword')?.errors?.['passwordMismatch']) {
                    Las contraseñas no coinciden
                  }
                </div>
              }
            </div>

            <!-- Términos y condiciones -->
            <div class="form-group">
              <label class="flex items-start">
                <input
                  type="checkbox"
                  formControlName="acceptTerms"
                  class="mt-1 mr-3 rounded border-gray-600 bg-gray-800 text-barberia-gold focus:ring-barberia-gold focus:ring-offset-0">
                <span class="text-sm text-gray-400">
                  Acepto los 
                  <a href="#" class="text-barberia-gold hover:text-barberia-goldLight">
                    términos y condiciones
                  </a>
                  y la 
                  <a href="#" class="text-barberia-gold hover:text-barberia-goldLight">
                    política de privacidad
                  </a>
                </span>
              </label>
              
              @if (isFieldInvalid('acceptTerms')) {
                <div class="form-error">
                  Debes aceptar los términos y condiciones
                </div>
              }
            </div>

            <!-- Botón submit -->
            <div>
              <button
                type="submit"
                [disabled]="registerForm.invalid || authService.isLoading()"
                class="w-full btn-primary flex justify-center items-center py-3">
                
                @if (authService.isLoading()) {
                  <app-loading-spinner size="small"></app-loading-spinner>
                  <span class="ml-2">Creando cuenta...</span>
                } @else {
                  Crear Cuenta
                }
              </button>
            </div>

            <!-- Enlaces adicionales -->
            <div class="text-center">
              <p class="text-sm text-gray-400">
                ¿Ya tienes cuenta?
                <a routerLink="/login" class="text-barberia-gold hover:text-barberia-goldLight font-medium">
                  Inicia sesión aquí
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public authService: AuthService,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^3\d{9}$/) // Formato colombiano: 3XXXXXXXXX
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/) // Al menos una letra y un número
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const userData = {
        nombre: this.registerForm.value.nombre,
        telefono: this.registerForm.value.telefono,
        password: this.registerForm.value.password
      };
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('¡Cuenta creada exitosamente!', 'Registro completado');
            this.toastr.info('Ahora puedes iniciar sesión', 'Siguiente paso');
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Error en registro:', error);
          if (error.status === 409) {
            this.toastr.error('Este número de celular ya está registrado', 'Error de registro');
          } else {
            this.toastr.error('Error al crear la cuenta. Intenta nuevamente.', 'Error de registro');
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getPasswordStrengthWidth(): number {
    const password = this.registerForm.get('password')?.value || '';
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

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword || password.value === confirmPassword.value) {
      return null;
    }

    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
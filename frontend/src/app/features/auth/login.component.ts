import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loginForm: FormGroup;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });

    // Obtener la URL de retorno
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          // Keycloak retorna directamente { access_token, refresh_token, expires_in }
          // El servicio ya procesó la respuesta en handleTokenResponse()
          this.toastr.success('¡Bienvenido!', 'Login exitoso');
          
          // Redirigir según el rol
          const userRole = this.authService.userRole();
          let redirectUrl = this.returnUrl;
          
          if (this.returnUrl === '/') {
            switch (userRole) {
              case 'ADMIN':
                redirectUrl = '/admin/gestion-barberos';
                break;
              case 'BARBERO':
                redirectUrl = '/barbero/agenda-diaria';
                break;
              case 'CLIENTE':
                redirectUrl = '/cliente/reservar';
                break;
              default:
                redirectUrl = '/';
            }
          }
          
          this.router.navigate([redirectUrl]);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.toastr.error('Credenciales incorrectas o usuario no encontrado', 'Error de autenticación');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
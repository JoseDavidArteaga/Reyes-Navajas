import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-account-disabled',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <!-- Icono de advertencia -->
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>

          <!-- Título -->
          <div class="text-center">
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Cuenta Deshabilitada
            </h2>
            
            <!-- Mensaje explicativo -->
            <div class="mt-6 text-center">
              <div class="text-sm text-gray-600 mb-6">
                <p class="mb-4">
                  Su cuenta de barbero ha sido temporalmente deshabilitada por el administrador.
                </p>
                <p class="mb-4">
                  Para resolver esta situación, por favor contacte al administrador de la barbería.
                </p>
                <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                  <div class="flex">
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-yellow-800">
                        ¿Qué puedes hacer?
                      </h3>
                      <div class="mt-2 text-sm text-yellow-700">
                        <ul class="list-disc list-inside space-y-1">
                          <li>Contacta al administrador de la barbería</li>
                          <li>Verifica que tu información esté actualizada</li>
                          <li>Espera a que tu cuenta sea reactivada</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="mt-6 space-y-3">
              <button
                (click)="logout()"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cerrar Sesión
              </button>
              
              <button
                (click)="goToLogin()"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccountDisabledComponent {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToLogin(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
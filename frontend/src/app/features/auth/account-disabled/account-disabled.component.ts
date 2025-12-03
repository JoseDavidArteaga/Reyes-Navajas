import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-account-disabled',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-gradient-to-b from-gray-800 to-gray-900 py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-yellow-600/20">
          <!-- Logo o icono decorativo -->
          <div class="text-center mb-6">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 shadow-lg mb-4">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="h-1 w-20 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
          </div>

          <!-- Título -->
          <div class="text-center">
            <h2 class="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              Cuenta Deshabilitada
            </h2>
            
            <!-- Mensaje explicativo -->
            <div class="mt-6 text-center">
              <div class="text-sm text-gray-300 mb-6">
                <p class="mb-4 text-gray-200">
                  Su cuenta de barbero ha sido temporalmente <span class="text-red-400 font-semibold">deshabilitada</span> por el administrador.
                </p>
                <p class="mb-4 text-gray-300">
                  Para resolver esta situación, por favor contacte al administrador de la barbería.
                </p>
                
                <!-- Panel de información estilizado -->
                <div class="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-600/30 rounded-lg p-4 mt-6 backdrop-blur-sm">
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-yellow-400">
                        ¿Qué puedes hacer?
                      </h3>
                      <div class="mt-2 text-sm text-gray-300">
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
            <div class="mt-8 space-y-3">
              <button
                (click)="logout()"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 transform transition-all duration-200 hover:scale-105"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Cerrar Sesión
              </button>
              
              <button
                (click)="goToLogin()"
                class="w-full flex justify-center py-3 px-4 border border-yellow-600/50 rounded-lg shadow-lg text-sm font-semibold text-yellow-400 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-yellow-900/20 hover:to-yellow-800/20 hover:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-800 transform transition-all duration-200 hover:scale-105"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Volver al Login
              </button>
            </div>

            <!-- Decoración inferior -->
            <div class="mt-8 flex justify-center">
              <div class="h-1 w-16 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Patrón decorativo de fondo -->
      <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-32 w-80 h-80 bg-yellow-600/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-32 w-80 h-80 bg-yellow-600/5 rounded-full blur-3xl"></div>
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
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cuenta-deshabilitada',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="mx-auto h-20 w-20 text-red-500 bg-gray-800 rounded-full flex items-center justify-center border-2 border-red-500 shadow-lg shadow-red-500/20 relative">
            <div class="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-pulse"></div>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 relative z-10">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z">
              </path>
            </svg>
          </div>
          <h2 class="mt-6 text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
            Cuenta Deshabilitada
          </h2>
          <p class="mt-2 text-sm text-gray-400">
            Tu cuenta de barbero se encuentra temporalmente deshabilitada
          </p>
        </div>

        <div class="bg-gray-900/80 backdrop-blur-sm shadow-2xl rounded-xl p-6 border border-gray-700/50 ring-1 ring-black/5">
          <div class="space-y-4">
            <!-- Alerta principal -->
            <div class="bg-gradient-to-r from-red-900/40 to-red-800/30 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-500/10"></div>
              <div class="relative flex">
                <div class="flex-shrink-0">
                  <div class="h-6 w-6 text-red-400 bg-red-500/20 rounded-full flex items-center justify-center ring-2 ring-red-500/30">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-300">
                    Acceso Restringido
                  </h3>
                  <div class="mt-2 text-sm text-red-200/90">
                    <p>Hola <span class="text-amber-400 font-semibold">{{ authService.currentUser()?.nombre }}</span>, 
                       tu cuenta ha sido desactivada por el administrador.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información detallada -->
            <div class="space-y-3 text-sm">
              <div class="flex items-center space-x-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                  </svg>
                </div>
                <span class="text-gray-300">No puedes acceder a las funciones de barbero mientras tu cuenta esté deshabilitada</span>
              </div>
              
              <div class="flex items-center space-x-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                    </path>
                  </svg>
                </div>
                <span class="text-gray-300">Contacta al administrador para más información</span>
              </div>

              <div class="flex items-center space-x-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                  </svg>
                </div>
                <span class="text-gray-300">Tu cuenta se reactivará cuando el administrador lo autorice</span>
              </div>
            </div>

            <!-- Información de contacto -->
            <div class="p-4 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-500/30 rounded-lg backdrop-blur-sm">
              <h4 class="text-amber-400 font-semibold mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                  </path>
                </svg>
                Información de Contacto
              </h4>
              <div class="text-xs text-gray-300 space-y-2">
                <div class="flex items-center space-x-2">
                  <span class="text-amber-400">📧</span>
                  <span>Administrador: admin&#64;reyesnavajas.com</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-amber-400">📞</span>
                  <span>Teléfono: +57 300 123 4567</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-amber-400">🏪</span>
                  <span>Barbería: Calle Principal #123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="space-y-3">
          <button 
            (click)="verificarEstado()"
            [disabled]="verificando"
            class="w-full flex justify-center py-3 px-4 border border-amber-500 rounded-xl shadow-lg text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-amber-500/25">
            <span *ngIf="!verificando" class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Verificar Estado de Cuenta
            </span>
            <span *ngIf="verificando" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando...
            </span>
          </button>
          
          <button 
            (click)="logout()"
            class="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-xl shadow-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-all duration-200">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
              </path>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CuentaDeshabilitadaComponent {
  verificando = false;

  constructor(public authService: AuthService) {}

  verificarEstado(): void {
    this.verificando = true;
    
    this.authService.verificarEstadoBarbero().subscribe({
      next: (activo) => {
        this.verificando = false;
        if (activo) {
          // Si la cuenta fue reactivada, redirigir al dashboard
          window.location.href = '/barbero/agenda-diaria';
        } else {
          // Mostrar mensaje de que sigue deshabilitada
          alert('Tu cuenta sigue deshabilitada. Contacta al administrador.');
        }
      },
      error: (error) => {
        this.verificando = false;
        console.error('Error verificando estado:', error);
        alert('Error al verificar el estado. Intenta más tarde.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
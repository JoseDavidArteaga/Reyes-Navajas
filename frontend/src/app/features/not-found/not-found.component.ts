import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-barberia-pattern">
      <div class="text-center">
        <div class="mb-8">
          <div class="text-9xl font-bold text-barberia-gold opacity-50">404</div>
        </div>
        
        <div class="mb-8">
          <h1 class="text-4xl font-display font-bold text-gray-100 mb-4">
            Página no encontrada
          </h1>
          <p class="text-lg text-gray-400 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/" class="btn-primary px-6 py-3">
              Ir al Inicio
            </a>
            <button 
              (click)="goBack()"
              class="btn-secondary px-6 py-3">
              Volver Atrás
            </button>
          </div>
        </div>

        <!-- Ilustración decorativa -->
        <div class="mt-16 text-6xl opacity-30">
          💇‍♂️
        </div>
        
        <!-- Links útiles -->
        <div class="mt-12">
          <p class="text-sm text-gray-500 mb-4">¿Necesitas ayuda? Prueba estos enlaces:</p>
          <div class="flex flex-wrap justify-center gap-4 text-sm">
            <a routerLink="/login" class="text-barberia-gold hover:text-barberia-goldLight">
              Iniciar Sesión
            </a>
            <span class="text-gray-600">•</span>
            <a routerLink="/registro" class="text-barberia-gold hover:text-barberia-goldLight">
              Registrarse
            </a>
            <span class="text-gray-600">•</span>
            <a href="mailto:info@reyesnavajas.com" class="text-barberia-gold hover:text-barberia-goldLight">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {
  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback a la página de inicio si no hay historial
      window.location.href = '/';
    }
  }
}
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-barberia-dark border-t border-gray-700 mt-auto">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Información de la barbería -->
          <div class="space-y-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-barberia-gold rounded-lg flex items-center justify-center mr-3">
                <span class="text-barberia-dark font-bold text-xl">R</span>
              </div>
              <span class="font-display text-xl font-semibold text-barberia-gold">
                Reyes & Navajas
              </span>
            </div>
            <p class="text-gray-400 text-sm">
              La mejor barbería de la ciudad. Tradición, estilo y profesionalismo 
              en cada servicio.
            </p>
          </div>

          <!-- Información de contacto -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-barberia-gold">Contacto</h3>
            <div class="space-y-2 text-gray-400 text-sm">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                info&#64;reyesnavajas.com
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
                Calle Principal #123, Centro
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
                +57 300 123 4567
              </div>
            </div>
          </div>

          <!-- Horarios -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-barberia-gold">Horarios</h3>
            <div class="space-y-1 text-gray-400 text-sm">
              <div class="flex justify-between">
                <span>Lunes - Viernes:</span>
                <span>8:00 AM - 6:00 PM</span>
              </div>
              <div class="flex justify-between">
                <span>Sábado:</span>
                <span>9:00 AM - 5:00 PM</span>
              </div>
              <div class="flex justify-between">
                <span>Domingo:</span>
                <span>10:00 AM - 3:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Separador -->
        <div class="border-t border-gray-700 mt-8 pt-6">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <p class="text-gray-500 text-sm">
              © {{ currentYear }} Reyes & Navajas. Todos los derechos reservados.
            </p>
            
            <!-- Enlaces adicionales -->
            <div class="mt-4 md:mt-0 flex space-x-6 text-sm">
              <a href="#" class="text-gray-400 hover:text-barberia-gold transition-colors">
                Política de Privacidad
              </a>
              <a href="#" class="text-gray-400 hover:text-barberia-gold transition-colors">
                Términos de Servicio
              </a>
              <a href="#" class="text-gray-400 hover:text-barberia-gold transition-colors">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
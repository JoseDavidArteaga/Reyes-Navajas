import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColaService } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';

@Component({
  selector: 'app-cola-virtual',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-gray-100 mb-2">
          Cola Virtual
        </h1>
        <p class="text-gray-400">
          Únete a la cola para ser atendido sin cita previa
        </p>
      </div>

      <!-- Estado actual del usuario en la cola -->
      @if (colaService.miPosicion()) {
        <div class="card mb-6 bg-barberia-gold bg-opacity-10 border-barberia-gold">
          <div class="text-center">
            <h2 class="text-2xl font-semibold text-barberia-gold mb-4">
              Estás en la cola
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-4xl font-bold text-barberia-gold">
                  {{ colaService.miPosicion()?.posicion }}
                </div>
                <div class="text-gray-400">Posición</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold text-barberia-gold">
                  {{ colaService.miPosicion()?.tiempoEspera }}
                </div>
                <div class="text-gray-400">Minutos aprox.</div>
              </div>
              <div class="text-center">
                <button 
                  (click)="salirDeCola()"
                  class="btn-danger">
                  Salir de la Cola
                </button>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Formulario para unirse a la cola -->
        <div class="card mb-6">
          <h2 class="text-xl font-semibold text-gray-100 mb-4">
            Únete a la cola virtual
          </h2>
          <p class="text-gray-400 mb-6">
            Sin cita previa, solo espera tu turno desde donde estés
          </p>
          <button 
            (click)="unirseACola()"
            [disabled]="colaService.isLoading()"
            class="btn-primary w-full py-3">
            @if (colaService.isLoading()) {
              <app-loading-spinner size="small"></app-loading-spinner>
              <span class="ml-2">Uniéndose...</span>
            } @else {
              Unirse a la Cola
            }
          </button>
        </div>
      }

      <!-- Estado actual de la cola -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-100 mb-4">
          Cola actual
        </h2>
        
        @if (colaService.isLoading() && !colaService.miPosicion()) {
          <app-loading-spinner message="Cargando estado de la cola..."></app-loading-spinner>
        } @else {
          <div class="space-y-3">
            @for (entrada of colaService.cola(); track entrada.id) {
              <div class="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-barberia-gold bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <span class="text-barberia-gold font-semibold">
                      {{ entrada.posicion }}
                    </span>
                  </div>
                  <div>
                    <p class="text-gray-100 font-medium">
                      {{ entrada.cliente?.nombre }}
                    </p>
                    @if (entrada.servicio) {
                      <p class="text-gray-400 text-sm">
                        {{ entrada.servicio.nombre }}
                      </p>
                    }
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-barberia-gold">
                    ~{{ entrada.tiempoEspera }} min
                  </span>
                  @if (entrada.estado === 'EN_SERVICIO') {
                    <div class="text-xs text-green-400 mt-1">
                      En servicio
                    </div>
                  }
                </div>
              </div>
            } @empty {
              <div class="text-center py-8">
                <div class="text-6xl mb-4 opacity-50">🪑</div>
                <p class="text-gray-400">
                  No hay nadie en la cola en este momento
                </p>
              </div>
            }
          </div>
        }
      </div>

      <!-- Información adicional -->
      <div class="mt-6 bg-gray-900 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-100 mb-2">
          ¿Cómo funciona?
        </h3>
        <div class="space-y-2 text-sm text-gray-400">
          <p>• Únete a la cola virtual sin necesidad de cita</p>
          <p>• Recibe una estimación del tiempo de espera</p>
          <p>• Puedes salir y volver cuando sea tu turno</p>
          <p>• Te notificaremos cuando estés próximo a ser atendido</p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColaVirtualComponent implements OnInit {

  constructor(public colaService: ColaService) {}

  ngOnInit(): void {
    // La cola se carga automáticamente en el servicio
  }

  unirseACola(): void {
    this.colaService.unirseACola({}).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Unido a la cola exitosamente');
        }
      },
      error: (error) => {
        console.error('Error al unirse a la cola:', error);
      }
    });
  }

  salirDeCola(): void {
    this.colaService.salirDeCola().subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Saliste de la cola');
        }
      },
      error: (error) => {
        console.error('Error al salir de la cola:', error);
      }
    });
  }
}
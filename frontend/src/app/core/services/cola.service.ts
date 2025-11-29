import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ColaVirtual, UnirseColaRequest, EstadoCola, ApiResponse } from '../interfaces';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ColaService {
  private readonly API_URL = 'http://localhost:8080/api/cola';
  private colaSignal = signal<ColaVirtual[]>([]);
  private miPosicionSignal = signal<ColaVirtual | null>(null);
  private isLoadingSignal = signal<boolean>(false);

  // Mock data para desarrollo
  private mockCola: ColaVirtual[] = [
    {
      id: '1',
      clienteId: '4',
      servicioId: '1',
      posicion: 1,
      tiempoEspera: 15,
      estado: EstadoCola.ESPERANDO,
      fechaIngreso: new Date(),
      cliente: { nombre: 'Pedro Martínez', telefono: '3005678901' },
      servicio: { nombre: 'Corte Clásico', duracion: 45 }
    },
    {
      id: '2',
      clienteId: '5',
      servicioId: '3',
      posicion: 2,
      tiempoEspera: 30,
      estado: EstadoCola.ESPERANDO,
      fechaIngreso: new Date(),
      cliente: { nombre: 'Ana García', telefono: '3006789012' },
      servicio: { nombre: 'Afeitado Clásico', duracion: 45 }
    }
  ];

  public cola = this.colaSignal.asReadonly();
  public miPosicion = this.miPosicionSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadCola();
    this.loadMiPosicion();
  }

  getCola(): Observable<ApiResponse<ColaVirtual[]>> {
    this.isLoadingSignal.set(true);
    
    const colaActual = this.mockCola
      .filter(c => c.estado === EstadoCola.ESPERANDO)
      .sort((a, b) => a.posicion - b.posicion);

    const mockResponse: ApiResponse<ColaVirtual[]> = {
      success: true,
      data: colaActual
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.colaSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      })
    );
  }

  unirseACola(request: UnirseColaRequest): Observable<ApiResponse<ColaVirtual>> {
    this.isLoadingSignal.set(true);
    
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar si el usuario ya está en la cola
    const yaEnCola = this.mockCola.find(c => 
      c.clienteId === currentUser.id && 
      c.estado === EstadoCola.ESPERANDO
    );

    if (yaEnCola) {
      return of({
        success: false,
        data: null as any,
        message: 'Ya estás en la cola virtual'
      }).pipe(
        tap(() => this.isLoadingSignal.set(false))
      );
    }

    const nuevaPosicion = Math.max(...this.mockCola.map(c => c.posicion), 0) + 1;
    const tiempoEspera = (nuevaPosicion - 1) * 45; // 45 min promedio por servicio

    const nuevaEntrada: ColaVirtual = {
      id: Date.now().toString(),
      clienteId: currentUser.id,
      servicioId: request.servicioId,
      barberoPreferido: request.barberoPreferido,
      posicion: nuevaPosicion,
      tiempoEspera: tiempoEspera,
      estado: EstadoCola.ESPERANDO,
      fechaIngreso: new Date(),
      cliente: { nombre: currentUser.nombre, telefono: currentUser.telefono }
    };

    this.mockCola.push(nuevaEntrada);

    const mockResponse: ApiResponse<ColaVirtual> = {
      success: true,
      data: nuevaEntrada
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.miPosicionSignal.set(response.data);
          this.loadCola();
        }
        this.isLoadingSignal.set(false);
      })
    );
  }

  salirDeCola(): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);
    
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const index = this.mockCola.findIndex(c => 
      c.clienteId === currentUser.id && 
      c.estado === EstadoCola.ESPERANDO
    );

    if (index !== -1) {
      this.mockCola[index].estado = EstadoCola.CANCELADO;
      this.reordenarCola();
    }

    const mockResponse: ApiResponse<void> = {
      success: index !== -1,
      data: undefined as any
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.miPosicionSignal.set(null);
          this.loadCola();
        }
        this.isLoadingSignal.set(false);
      })
    );
  }

  getMiPosicion(): Observable<ApiResponse<ColaVirtual | null>> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      return of({
        success: true,
        data: null
      });
    }

    const miPosicion = this.mockCola.find(c => 
      c.clienteId === currentUser.id && 
      c.estado === EstadoCola.ESPERANDO
    );

    return of({
      success: true,
      data: miPosicion || null
    }).pipe(
      tap(response => {
        this.miPosicionSignal.set(response.data);
      })
    );
  }

  atenderSiguiente(): Observable<ApiResponse<ColaVirtual | null>> {
    this.isLoadingSignal.set(true);
    
    const siguiente = this.mockCola
      .filter(c => c.estado === EstadoCola.ESPERANDO)
      .sort((a, b) => a.posicion - b.posicion)[0];

    if (siguiente) {
      const index = this.mockCola.findIndex(c => c.id === siguiente.id);
      this.mockCola[index].estado = EstadoCola.EN_SERVICIO;
      this.mockCola[index].fechaAtencion = new Date();
      this.reordenarCola();
    }

    const mockResponse: ApiResponse<ColaVirtual | null> = {
      success: true,
      data: siguiente || null
    };

    return of(mockResponse).pipe(
      tap(response => {
        this.loadCola();
        this.isLoadingSignal.set(false);
      })
    );
  }

  finalizarAtencion(clienteId: string): Observable<ApiResponse<void>> {
    const index = this.mockCola.findIndex(c => 
      c.clienteId === clienteId && 
      c.estado === EstadoCola.EN_SERVICIO
    );

    if (index !== -1) {
      this.mockCola[index].estado = EstadoCola.ATENDIDO;
    }

    return of({
      success: index !== -1,
      data: undefined as any
    }).pipe(
      tap(response => {
        this.loadCola();
      })
    );
  }

  private reordenarCola(): void {
    const colaEsperando = this.mockCola
      .filter(c => c.estado === EstadoCola.ESPERANDO)
      .sort((a, b) => a.posicion - b.posicion);

    colaEsperando.forEach((entrada, index) => {
      entrada.posicion = index + 1;
      entrada.tiempoEspera = index * 45; // Recalcular tiempo de espera
    });
  }

  private loadCola(): void {
    this.getCola().subscribe();
  }

  private loadMiPosicion(): void {
    this.getMiPosicion().subscribe();
  }
}
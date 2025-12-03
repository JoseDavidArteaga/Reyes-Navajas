import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ColaVirtual, UnirseColaRequest, EstadoCola, ApiResponse } from '../interfaces';
import { AuthService } from './auth.service';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ColaService {
  private colaSignal = signal<ColaVirtual[]>([]);
  private miPosicionSignal = signal<ColaVirtual | null>(null);
  private isLoadingSignal = signal<boolean>(false);

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
    
    return this.http.get<ApiResponse<ColaVirtual[]>>(API_CONFIG.ENDPOINTS.TURNOS + '/cola').pipe(
      tap(response => {
        if (response.success) {
          this.colaSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener la cola',
          data: []
        } as ApiResponse<ColaVirtual[]>);
      })
    );
  }

  unirseACola(request: UnirseColaRequest): Observable<ApiResponse<ColaVirtual>> {
    this.isLoadingSignal.set(true);
    
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    return this.http.post<ApiResponse<ColaVirtual>>(API_CONFIG.ENDPOINTS.TURNOS + '/cola/unirse', request).pipe(
      tap(response => {
        if (response.success) {
          this.miPosicionSignal.set(response.data);
          this.loadCola();
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al unirse a la cola',
          data: null as any
        } as ApiResponse<ColaVirtual>);
      })
    );
  }

  salirDeCola(): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);
    
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    return this.http.delete<ApiResponse<void>>(`${API_CONFIG.ENDPOINTS.TURNOS}/cola/salir`).pipe(
      tap(response => {
        if (response.success) {
          this.miPosicionSignal.set(null);
          this.loadCola();
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al salir de la cola',
          data: undefined as any
        } as ApiResponse<void>);
      })
    );
  }

  getMiPosicion(): Observable<ApiResponse<ColaVirtual | null>> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      return of({ success: true, data: null });
    }

    return this.http.get<ApiResponse<ColaVirtual | null>>(`${API_CONFIG.ENDPOINTS.TURNOS}/cola/mi-posicion`).pipe(
      tap(response => {
        this.miPosicionSignal.set(response.data);
      }),
      catchError(error => {
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener posición en cola',
          data: null
        } as ApiResponse<ColaVirtual | null>);
      })
    );
  }

  atenderSiguiente(): Observable<ApiResponse<ColaVirtual | null>> {
    this.isLoadingSignal.set(true);
    
    return this.http.post<ApiResponse<ColaVirtual | null>>(`${API_CONFIG.ENDPOINTS.TURNOS}/cola/atender-siguiente`, {}).pipe(
      tap(response => {
        this.loadCola();
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al atender siguiente en cola',
          data: null as any
        } as ApiResponse<ColaVirtual | null>);
      })
    );
  }

  finalizarAtencion(clienteId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API_CONFIG.ENDPOINTS.TURNOS}/cola/finalizar-atencion`, { clienteId }).pipe(
      tap(response => {
        this.loadCola();
      }),
      catchError(error => {
        return of({
          success: false,
          error: error.error?.message || 'Error al finalizar atención',
          data: undefined as any
        } as ApiResponse<void>);
      })
    );
  }

  private loadCola(): void {
    this.getCola().subscribe();
  }

  private loadMiPosicion(): void {
    this.getMiPosicion().subscribe();
  }
}
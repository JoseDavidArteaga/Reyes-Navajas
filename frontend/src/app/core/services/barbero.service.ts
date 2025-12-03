import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Barbero, CreateBarberoRequest, UpdateBarberoRequest, ApiResponse, PaginatedResponse, EstadoBarbero, HorarioTrabajo } from '../interfaces';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class BarberoService {
  private barberosSignal = signal<Barbero[]>([]);
  private isLoadingSignal = signal<boolean>(false);

  public barberos = this.barberosSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  constructor(private http: HttpClient) {
    this.loadBarberos();
  }

  getAllBarberos(): Observable<ApiResponse<Barbero[]>> {
    this.isLoadingSignal.set(true);
    
    return this.http.get<ApiResponse<Barbero[]>>(API_CONFIG.ENDPOINTS.BARBEROS).pipe(
      tap(response => {
        if (response.success) {
          this.barberosSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener barberos',
          data: []
        } as ApiResponse<Barbero[]>);
      })
    );
  }

  getBarberoById(id: string): Observable<ApiResponse<Barbero>> {
    return this.http.get<ApiResponse<Barbero>>(`${API_CONFIG.ENDPOINTS.BARBEROS}/${id}`).pipe(
      catchError(error => {
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener barbero',
          data: null as any
        } as ApiResponse<Barbero>);
      })
    );
  }

  createBarbero(barbero: CreateBarberoRequest): Observable<ApiResponse<Barbero>> {
    this.isLoadingSignal.set(true);
    
    return this.http.post<ApiResponse<Barbero>>(API_CONFIG.ENDPOINTS.BARBEROS, barbero).pipe(
      tap(response => {
        if (response.success) {
          this.loadBarberos();
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al crear barbero',
          data: null as any
        } as ApiResponse<Barbero>);
      })
    );
  }

  updateBarbero(id: string, barbero: UpdateBarberoRequest): Observable<ApiResponse<Barbero>> {
    this.isLoadingSignal.set(true);
    
    return this.http.put<ApiResponse<Barbero>>(`${API_CONFIG.ENDPOINTS.BARBEROS}/${id}`, barbero).pipe(
      tap(response => {
        if (response.success) {
          this.loadBarberos();
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al actualizar barbero',
          data: null as any
        } as ApiResponse<Barbero>);
      })
    );
  }

  deleteBarbero(id: string): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);
    
    return this.http.delete<ApiResponse<void>>(`${API_CONFIG.ENDPOINTS.BARBEROS}/${id}`).pipe(
      tap(response => {
        if (response.success) {
          this.loadBarberos();
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al eliminar barbero',
          data: undefined as any
        } as ApiResponse<void>);
      })
    );
  }

  getBarberosActivos(): Observable<ApiResponse<Barbero[]>> {
    return this.http.get<ApiResponse<Barbero[]>>(`${API_CONFIG.ENDPOINTS.BARBEROS}/activos`).pipe(
      catchError(error => {
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener barberos activos',
          data: []
        } as ApiResponse<Barbero[]>);
      })
    );
  }

  cambiarEstadoBarbero(id: string, estado: EstadoBarbero): Observable<ApiResponse<Barbero>> {
    return this.updateBarbero(id, { estado });
  }

  private loadBarberos(): void {
    this.getAllBarberos().subscribe();
  }
}
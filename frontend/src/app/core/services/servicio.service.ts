import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Servicio, CreateServicioRequest, UpdateServicioRequest, ApiResponse } from '../interfaces';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private serviciosSignal = signal<Servicio[]>([]);
  private isLoadingSignal = signal<boolean>(false);

  // Mock data para desarrollo
  private mockServicios: Servicio[] = [
    {
      id: '1',
      nombre: 'Corte Clásico',
      descripcion: 'Corte tradicional con tijera y máquina',
      duracion: 45,
      precio: 25000,
      activo: true,
      categoria: 'Corte'
    },
    {
      id: '2',
      nombre: 'Corte y Barba',
      descripcion: 'Corte de cabello + arreglo de barba',
      duracion: 60,
      precio: 35000,
      activo: true,
      categoria: 'Combo'
    },
    {
      id: '3',
      nombre: 'Afeitado Clásico',
      descripcion: 'Afeitado tradicional con navaja y toalla caliente',
      duracion: 45,
      precio: 20000,
      activo: true,
      categoria: 'Afeitado'
    },
    {
      id: '4',
      nombre: 'Corte Moderno',
      descripcion: 'Cortes actuales y degradados',
      duracion: 50,
      precio: 30000,
      activo: true,
      categoria: 'Corte'
    },
    {
      id: '5',
      nombre: 'Arreglo de Barba',
      descripcion: 'Perfilado y arreglo de barba',
      duracion: 30,
      precio: 15000,
      activo: true,
      categoria: 'Barba'
    }
  ];

  public servicios = this.serviciosSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  constructor(private http: HttpClient) {
    this.loadServicios();
  }

  getAllServicios(): Observable<ApiResponse<Servicio[]>> {
    this.isLoadingSignal.set(true);
    
    return this.http.get<ApiResponse<Servicio[]>>(API_CONFIG.ENDPOINTS.CATALOGO + '/servicios').pipe(
      tap(response => {
        if (response.success) {
          this.serviciosSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener servicios',
          data: []
        } as ApiResponse<Servicio[]>);
      })
    );
  }

  getServicioById(id: string): Observable<ApiResponse<Servicio>> {
    return this.http.get<ApiResponse<Servicio>>(`${API_CONFIG.ENDPOINTS.CATALOGO}/servicios/${id}`).pipe(
      catchError(error => {
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener servicio',
          data: null as any
        } as ApiResponse<Servicio>);
      })
    );
  }

  createServicio(servicio: CreateServicioRequest): Observable<ApiResponse<Servicio>> {
    this.isLoadingSignal.set(true);
    
    return this.http.post<ApiResponse<Servicio>>(API_CONFIG.ENDPOINTS.CATALOGO + '/servicios', servicio).pipe(
      tap(response => {
        if (response.success) {
          this.loadServicios();
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al crear servicio',
          data: null as any
        } as ApiResponse<Servicio>);
      })
    );
  }

  updateServicio(id: string, servicio: UpdateServicioRequest): Observable<ApiResponse<Servicio>> {
    this.isLoadingSignal.set(true);
    
    return this.http.put<ApiResponse<Servicio>>(`${API_CONFIG.ENDPOINTS.CATALOGO}/servicios/${id}`, servicio).pipe(
      tap(response => {
        if (response.success) {
          this.loadServicios();
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al actualizar servicio',
          data: null as any
        } as ApiResponse<Servicio>);
      })
    );
  }

  deleteServicio(id: string): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);
    
    return this.http.delete<ApiResponse<void>>(`${API_CONFIG.ENDPOINTS.CATALOGO}/servicios/${id}`).pipe(
      tap(response => {
        if (response.success) {
          this.loadServicios();
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al eliminar servicio',
          data: undefined as any
        } as ApiResponse<void>);
      })
    );
  }

  getServiciosActivos(): Observable<ApiResponse<Servicio[]>> {
    return this.http.get<ApiResponse<Servicio[]>>(API_CONFIG.ENDPOINTS.CATALOGO + '/servicios/activos').pipe(
      catchError(error => {
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener servicios activos',
          data: []
        } as ApiResponse<Servicio[]>);
      })
    );
  }

  private loadServicios(): void {
    this.getAllServicios().subscribe();
  }
}
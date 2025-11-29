import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Servicio, CreateServicioRequest, UpdateServicioRequest, ApiResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private readonly API_URL = 'http://localhost:8080/api/servicios';
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
    
    const mockResponse: ApiResponse<Servicio[]> = {
      success: true,
      data: this.mockServicios
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.serviciosSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      })
    );

    // Implementación real:
    /*
    return this.http.get<ApiResponse<Servicio[]>>(this.API_URL).pipe(
      tap(response => {
        if (response.success) {
          this.serviciosSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      })
    );
    */
  }

  getServicioById(id: string): Observable<ApiResponse<Servicio>> {
    const servicio = this.mockServicios.find(s => s.id === id);
    
    return of({
      success: !!servicio,
      data: servicio!
    });
  }

  createServicio(servicio: CreateServicioRequest): Observable<ApiResponse<Servicio>> {
    this.isLoadingSignal.set(true);
    
    const newServicio: Servicio = {
      id: Date.now().toString(),
      ...servicio,
      activo: true,
      fechaCreacion: new Date()
    };

    this.mockServicios.push(newServicio);

    const mockResponse: ApiResponse<Servicio> = {
      success: true,
      data: newServicio
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.serviciosSignal.set([...this.mockServicios]);
        }
        this.isLoadingSignal.set(false);
      })
    );
  }

  updateServicio(id: string, servicio: UpdateServicioRequest): Observable<ApiResponse<Servicio>> {
    this.isLoadingSignal.set(true);
    
    const index = this.mockServicios.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockServicios[index] = { ...this.mockServicios[index], ...servicio };
    }

    const mockResponse: ApiResponse<Servicio> = {
      success: index !== -1,
      data: this.mockServicios[index]
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.serviciosSignal.set([...this.mockServicios]);
        }
        this.isLoadingSignal.set(false);
      })
    );
  }

  deleteServicio(id: string): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);
    
    const index = this.mockServicios.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockServicios.splice(index, 1);
    }

    const mockResponse: ApiResponse<void> = {
      success: index !== -1,
      data: undefined as any
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.serviciosSignal.set([...this.mockServicios]);
        }
        this.isLoadingSignal.set(false);
      })
    );
  }

  getServiciosActivos(): Observable<ApiResponse<Servicio[]>> {
    const serviciosActivos = this.mockServicios.filter(s => s.activo);
    
    return of({
      success: true,
      data: serviciosActivos
    });
  }

  private loadServicios(): void {
    this.getAllServicios().subscribe();
  }
}
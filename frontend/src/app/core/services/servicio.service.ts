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
  private readonly API_URL = API_CONFIG.ENDPOINTS.CATALOGO + '/servicios';
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
    
    return this.http.get<any[]>(this.API_URL).pipe(
      tap(servicios => {
        // Mapear la respuesta del backend al formato esperado
        const mappedServicios = servicios.map(s => ({
          id: s.id?.toString() || '',
          nombre: s.nombre,
          descripcion: s.descripcion,
          duracion: s.duracion,
          precio: s.precio,
          activo: s.activo !== false,
          categoria: s.categoria,
          imagen: s.imagenUrl
        }));
        
        this.serviciosSignal.set(mappedServicios);
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Error loading servicios:', error);
        this.isLoadingSignal.set(false);
        return of([]);
      })
    ) as any;
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
    return this.getAllServicios().pipe(
      tap(response => {
        if ((response as any).length) {
          // Si es array directo del backend
          const serviciosActivos = (response as any).filter((s: any) => s.activo !== false);
          this.serviciosSignal.set(serviciosActivos);
        }
      })
    );
  }

  private loadServicios(): void {
    this.getAllServicios().subscribe({
      next: (response) => {
        console.log('Servicios loaded successfully');
      },
      error: (error) => {
        console.error('Error loading initial servicios:', error);
      }
    });
  }

  // Métodos para manejar FormData con imágenes
  createServicioWithImage(formData: FormData): Observable<ApiResponse<Servicio>> {
    this.isLoadingSignal.set(true);
    
    return this.http.post<any>(this.API_URL, formData).pipe(
      tap(response => {
        // Recargar servicios después de crear
        this.getAllServicios().subscribe();
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Error creating servicio:', error);
        this.isLoadingSignal.set(false);
        return of({ success: false, error: 'Error al crear servicio', data: null as any } as ApiResponse<Servicio>);
      })
    ) as any;
  }

  updateServicioWithImage(id: string, formData: FormData): Observable<ApiResponse<Servicio>> {
    this.isLoadingSignal.set(true);
    
    return this.http.put<any>(`${this.API_URL}/${id}`, formData).pipe(
      tap(response => {
        // Recargar servicios después de actualizar
        this.getAllServicios().subscribe();
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Error updating servicio:', error);
        this.isLoadingSignal.set(false);
        return of({ success: false, error: 'Error al actualizar servicio', data: null as any } as ApiResponse<Servicio>);
      })
    ) as any;
  }
}
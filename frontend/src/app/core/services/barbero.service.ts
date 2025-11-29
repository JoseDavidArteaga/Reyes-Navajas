import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Barbero, CreateBarberoRequest, UpdateBarberoRequest, ApiResponse, PaginatedResponse, EstadoBarbero, HorarioTrabajo } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class BarberoService {
  private readonly API_URL = 'http://localhost:8080/api/barberos';
  private barberosSignal = signal<Barbero[]>([]);
  private isLoadingSignal = signal<boolean>(false);

  // Mock data para desarrollo
  private mockBarberos: Barbero[] = [
    {
      id: '1',
      nombre: 'Carlos Rodríguez',
      telefono: '3002345678',
      especialidades: ['Corte Clásico', 'Barba', 'Afeitado'],
      estado: EstadoBarbero.ACTIVO,
      horario: [
        { diaSemana: 1, horaInicio: '08:00', horaFin: '17:00', activo: true },
        { diaSemana: 2, horaInicio: '08:00', horaFin: '17:00', activo: true },
        { diaSemana: 3, horaInicio: '08:00', horaFin: '17:00', activo: true },
        { diaSemana: 4, horaInicio: '08:00', horaFin: '17:00', activo: true },
        { diaSemana: 5, horaInicio: '08:00', horaFin: '17:00', activo: true },
        { diaSemana: 6, horaInicio: '09:00', horaFin: '15:00', activo: true },
        { diaSemana: 0, horaInicio: '09:00', horaFin: '15:00', activo: false }
      ],
      calificacionPromedio: 4.8,
      totalServicios: 1250
    },
    {
      id: '2',
      nombre: 'Miguel Torres',
      telefono: '3003456789',
      especialidades: ['Corte Moderno', 'Degradados', 'Diseño'],
      estado: EstadoBarbero.ACTIVO,
      horario: [
        { diaSemana: 1, horaInicio: '09:00', horaFin: '18:00', activo: true },
        { diaSemana: 2, horaInicio: '09:00', horaFin: '18:00', activo: true },
        { diaSemana: 3, horaInicio: '09:00', horaFin: '18:00', activo: true },
        { diaSemana: 4, horaInicio: '09:00', horaFin: '18:00', activo: true },
        { diaSemana: 5, horaInicio: '09:00', horaFin: '18:00', activo: true },
        { diaSemana: 6, horaInicio: '10:00', horaFin: '16:00', activo: true },
        { diaSemana: 0, horaInicio: '10:00', horaFin: '16:00', activo: true }
      ],
      calificacionPromedio: 4.9,
      totalServicios: 890
    }
  ];

  public barberos = this.barberosSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  constructor(private http: HttpClient) {
    this.loadBarberos();
  }

  getAllBarberos(): Observable<ApiResponse<Barbero[]>> {
    this.isLoadingSignal.set(true);
    
    // Mock response
    const mockResponse: ApiResponse<Barbero[]> = {
      success: true,
      data: this.mockBarberos
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.barberosSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      })
    );

    // Implementación real:
    /*
    return this.http.get<ApiResponse<Barbero[]>>(this.API_URL).pipe(
      tap(response => {
        if (response.success) {
          this.barberosSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      })
    );
    */
  }

  getBarberoById(id: string): Observable<ApiResponse<Barbero>> {
    const barbero = this.mockBarberos.find(b => b.id === id);
    
    const mockResponse: ApiResponse<Barbero> = {
      success: !!barbero,
      data: barbero!
    };

    return of(mockResponse);

    // Implementación real:
    // return this.http.get<ApiResponse<Barbero>>(`${this.API_URL}/${id}`);
  }

  createBarbero(barbero: CreateBarberoRequest): Observable<ApiResponse<Barbero>> {
    this.isLoadingSignal.set(true);
    
    const newBarbero: Barbero = {
      id: Date.now().toString(),
      ...barbero,
      estado: EstadoBarbero.ACTIVO,
      calificacionPromedio: 0,
      totalServicios: 0
    };

    this.mockBarberos.push(newBarbero);
    
    const mockResponse: ApiResponse<Barbero> = {
      success: true,
      data: newBarbero
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.barberosSignal.set([...this.mockBarberos]);
        }
        this.isLoadingSignal.set(false);
      })
    );

    // Implementación real:
    /*
    return this.http.post<ApiResponse<Barbero>>(this.API_URL, barbero).pipe(
      tap(response => {
        if (response.success) {
          const currentBarberos = this.barberosSignal();
          this.barberosSignal.set([...currentBarberos, response.data]);
        }
        this.isLoadingSignal.set(false);
      })
    );
    */
  }

  updateBarbero(id: string, barbero: UpdateBarberoRequest): Observable<ApiResponse<Barbero>> {
    this.isLoadingSignal.set(true);
    
    const index = this.mockBarberos.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBarberos[index] = { ...this.mockBarberos[index], ...barbero };
    }

    const mockResponse: ApiResponse<Barbero> = {
      success: index !== -1,
      data: this.mockBarberos[index]
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.barberosSignal.set([...this.mockBarberos]);
        }
        this.isLoadingSignal.set(false);
      })
    );

    // Implementación real:
    /*
    return this.http.put<ApiResponse<Barbero>>(`${this.API_URL}/${id}`, barbero).pipe(
      tap(response => {
        if (response.success) {
          const currentBarberos = this.barberosSignal();
          const index = currentBarberos.findIndex(b => b.id === id);
          if (index !== -1) {
            const updatedBarberos = [...currentBarberos];
            updatedBarberos[index] = response.data;
            this.barberosSignal.set(updatedBarberos);
          }
        }
        this.isLoadingSignal.set(false);
      })
    );
    */
  }

  deleteBarbero(id: string): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);
    
    const index = this.mockBarberos.findIndex(b => b.id === id);
    if (index !== -1) {
      this.mockBarberos.splice(index, 1);
    }

    const mockResponse: ApiResponse<void> = {
      success: index !== -1,
      data: undefined as any
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.barberosSignal.set([...this.mockBarberos]);
        }
        this.isLoadingSignal.set(false);
      })
    );
  }

  getBarberosActivos(): Observable<ApiResponse<Barbero[]>> {
    const barberosActivos = this.mockBarberos.filter(b => b.estado === EstadoBarbero.ACTIVO);
    
    return of({
      success: true,
      data: barberosActivos
    });
  }

  cambiarEstadoBarbero(id: string, estado: EstadoBarbero): Observable<ApiResponse<Barbero>> {
    return this.updateBarbero(id, { estado });
  }

  private loadBarberos(): void {
    this.getAllBarberos().subscribe();
  }
}
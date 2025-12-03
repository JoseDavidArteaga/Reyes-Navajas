import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Barbero, CreateBarberoRequest, UpdateBarberoRequest, ApiResponse, PaginatedResponse, EstadoBarbero, HorarioTrabajo } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class BarberoService {
  private readonly API_URL = 'http://localhost:8089/usuarios/barberos';
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
    
    return this.http.get<ApiResponse<Barbero[]>>(this.API_URL).pipe(
      tap(response => {
        if (response.success) {
          // Mapear la respuesta del backend al formato esperado
          const mappedBarberos = response.data.map(b => ({
            ...b,
            estado: b.estado ? EstadoBarbero.ACTIVO : EstadoBarbero.INACTIVO
          }));
          this.barberosSignal.set(mappedBarberos);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Error obteniendo barberos:', error);
        this.isLoadingSignal.set(false);
        return of({ success: false, data: [] } as ApiResponse<Barbero[]>);
      })
    );
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
    
    const requestBody = {
      nombre: barbero.nombre,
      telefono: barbero.telefono,
      contrasenia: barbero.contrasenia, // Contraseña ingresada por el usuario
      rol: 'barbero',
      estado: true
    };

    return this.http.post<ApiResponse<Barbero>>(this.API_URL, requestBody).pipe(
      tap(response => {
        if (response.success) {
          const currentBarberos = this.barberosSignal();
          this.barberosSignal.set([...currentBarberos, response.data]);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Error creando barbero:', error);
        this.isLoadingSignal.set(false);
        throw error;
      })
    );
  }

  updateBarbero(id: string, barbero: UpdateBarberoRequest): Observable<ApiResponse<Barbero>> {
    this.isLoadingSignal.set(true);
    
    const requestBody = {
      nombre: barbero.nombre,
      telefono: barbero.telefono,
      contrasenia: (barbero as any).contrasenia, // Si se envía contraseña, actualizar
      estado: barbero.estado !== undefined ? (barbero.estado === EstadoBarbero.ACTIVO) : undefined
    };

    return this.http.put<ApiResponse<Barbero>>(`${this.API_URL}/${id}`, requestBody).pipe(
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
      }),
      catchError(error => {
        console.error('Error actualizando barbero:', error);
        this.isLoadingSignal.set(false);
        throw error;
      })
    );
  }

  deleteBarbero(id: string): Observable<ApiResponse<void>> {
    this.isLoadingSignal.set(true);
    
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap(response => {
        if (response.success) {
          const currentBarberos = this.barberosSignal();
          const filtered = currentBarberos.filter(b => b.id !== id);
          this.barberosSignal.set(filtered);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Error eliminando barbero:', error);
        this.isLoadingSignal.set(false);
        throw error;
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

  // Método específico para toggle de estado (similar a servicios)
  toggleEstadoBarbero(id: string, nuevoEstado: boolean): Observable<ApiResponse<Barbero>> {
    this.isLoadingSignal.set(true);
    console.log(`Changing estado of barbero ${id} to ${nuevoEstado}`);
    
    return this.http.put<any>(`${this.API_URL}/${id}/estado?estado=${nuevoEstado}`, {}).pipe(
      tap(response => {
        if (response.success) {
          // Actualizar el estado local del barbero
          const currentBarberos = this.barberosSignal();
          const index = currentBarberos.findIndex(b => b.id === id);
          if (index !== -1) {
            const updatedBarberos = [...currentBarberos];
            updatedBarberos[index] = {
              ...updatedBarberos[index],
              estado: nuevoEstado ? EstadoBarbero.ACTIVO : EstadoBarbero.INACTIVO
            };
            this.barberosSignal.set(updatedBarberos);
          }
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Error changing barbero state:', error);
        this.isLoadingSignal.set(false);
        return of({ 
          success: false, 
          error: 'Error al cambiar estado del barbero',
          data: null as any
        } as ApiResponse<Barbero>);
      })
    );
  }

  private loadBarberos(): void {
    this.getAllBarberos().subscribe();
  }
}
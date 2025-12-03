import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { 
  Reserva, 
  CreateReservaRequest, 
  UpdateReservaRequest, 
  DisponibilidadBarbero,
  HorarioDisponible,
  EstadoReserva,
  ApiResponse 
} from '../interfaces';
import { AuthService } from './auth.service';
import { API_CONFIG } from '../config/api.config';
import { addDays, format, isAfter, isBefore, setHours, setMinutes } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private reservasSignal = signal<Reserva[]>([]);
  private isLoadingSignal = signal<boolean>(false);

  public reservas = this.reservasSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadReservas();
  }

  getAllReservas(): Observable<ApiResponse<Reserva[]>> {
    this.isLoadingSignal.set(true);
    
    return this.http.get<ApiResponse<Reserva[]>>(API_CONFIG.ENDPOINTS.TURNOS + '/reservas').pipe(
      tap(response => {
        if (response.success) {
          this.reservasSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener reservas',
          data: []
        } as ApiResponse<Reserva[]>);
      })
    );
  }

  getReservasByCliente(clienteId: string): Observable<ApiResponse<Reserva[]>> {
    return this.http.get<ApiResponse<Reserva[]>>(`${API_CONFIG.ENDPOINTS.TURNOS}/reservas/cliente/${clienteId}`).pipe(
      catchError(error => {
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener reservas del cliente',
          data: []
        } as ApiResponse<Reserva[]>);
      })
    );
  }

  getReservasByBarbero(barberoId: string, fecha?: Date): Observable<ApiResponse<Reserva[]>> {
    let url = `${API_CONFIG.ENDPOINTS.TURNOS}/reservas/barbero/${barberoId}`;
    if (fecha) {
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      url += `?fecha=${fechaStr}`;
    }
    
    return this.http.get<ApiResponse<Reserva[]>>(url).pipe(
      catchError(error => {
        return of({
          success: false,
          error: error.error?.message || 'Error al obtener reservas del barbero',
          data: []
        } as ApiResponse<Reserva[]>);
      })
    );
  }

/*   createReserva(reserva: CreateReservaRequest): Observable<ApiResponse<Reserva>> {
    this.isLoadingSignal.set(true);
    
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const newReserva: Reserva = {
      id: Date.now().toString(),
      clienteId: currentUser.id,
      barberoId: reserva.barberoId,
      servicioId: reserva.servicioId,
      fechaHora: new Date(reserva.fechaHora),
      estado: EstadoReserva.PENDIENTE,
      notas: reserva.notas,
      fechaCreacion: new Date()
    };

    this.mockReservas.push(newReserva);

    const mockResponse: ApiResponse<Reserva> = {
      success: true,
      data: newReserva
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.reservasSignal.set([...this.mockReservas]);
        }
        this.isLoadingSignal.set(false);
      })
    );
  } */
  createReserva(reserva: CreateReservaRequest): Observable<ApiResponse<Reserva>> {
  this.isLoadingSignal.set(true);

  const currentUser = this.authService.currentUser();
  if (!currentUser) {
    throw new Error('Usuario no autenticado');
  }

  // Se envía al backend igual que lo recibes
  const body = {
    clienteId: currentUser.id,
    barberoId: reserva.barberoId,
    servicioId: reserva.servicioId,
    fechaHora: reserva.fechaHora,      // debe ser string ISO, el backend lo parsea
    notas: reserva.notas,
  };

  return this.http.post<ApiResponse<Reserva>>(API_CONFIG.ENDPOINTS.TURNOS + '/reservas', body).pipe(
    tap(response => {
      if (response.success && response.data) {
        // Actualiza estados en Angular
        this.loadReservas();
      }
      this.isLoadingSignal.set(false);
    }),
    catchError(error => {
      this.isLoadingSignal.set(false);
      return of({
        success: false,
        error: error.error?.message || 'Error al crear reserva',
        data: null as any
      } as ApiResponse<Reserva>);
    })
  );
}

  updateReserva(id: string, reserva: UpdateReservaRequest): Observable<ApiResponse<Reserva>> {
    this.isLoadingSignal.set(true);
    
    return this.http.put<ApiResponse<Reserva>>(`${API_CONFIG.ENDPOINTS.TURNOS}/reservas/${id}`, reserva).pipe(
      tap(response => {
        if (response.success) {
          this.loadReservas();
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error al actualizar reserva',
          data: null as any
        } as ApiResponse<Reserva>);
      })
    );
  }

  cancelarReserva(id: string): Observable<ApiResponse<Reserva>> {
    return this.updateReserva(id, { estado: EstadoReserva.CANCELADA });
  }

  confirmarReserva(id: string): Observable<ApiResponse<Reserva>> {
    return this.updateReserva(id, { estado: EstadoReserva.CONFIRMADA });
  }

  iniciarServicio(id: string): Observable<ApiResponse<Reserva>> {
    return this.updateReserva(id, { estado: EstadoReserva.EN_PROGRESO });
  }

  finalizarServicio(id: string): Observable<ApiResponse<Reserva>> {
    return this.updateReserva(id, { estado: EstadoReserva.FINALIZADA });
  }

  getDisponibilidadBarbero(barberoId: string, fechaInicio: Date, dias: number = 7): Observable<ApiResponse<DisponibilidadBarbero>> {
    const horarios: HorarioDisponible[] = [];
    
    for (let i = 0; i < dias; i++) {
      const fecha = addDays(fechaInicio, i);
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      
      // Generar horarios disponibles (mock)
      const horasDisponibles = this.generarHorasDisponibles(barberoId, fecha);
      
      horarios.push({
        fecha: fechaStr,
        horasDisponibles
      });
    }

    const disponibilidad: DisponibilidadBarbero = {
      barberoId,
      horarios
    };

    return of({
      success: true,
      data: disponibilidad
    });
  }

  private generarHorasDisponibles(barberoId: string, fecha: Date): string[] {
    const horas: string[] = [];
    const diaSemana = fecha.getDay();
    
    // Mock horario de trabajo (8:00 AM - 6:00 PM)
    const horaInicio = 8;
    const horaFin = 18;
    
    // Para simplificar, generar horarios cada 30 minutos sin verificar conflictos
    // En la implementación real, esto se haría consultando la API
    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaCompleta = setMinutes(setHours(fecha, hora), minuto);
        const horaStr = format(horaCompleta, 'HH:mm');
        horas.push(horaStr);
      }
    }

    return horas;
  }

  private loadReservas(): void {
    this.getAllReservas().subscribe();
  }
}
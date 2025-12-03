import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { tap } from 'rxjs/operators';
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
import { addDays, format, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly API_URL = API_CONFIG.ENDPOINTS.TURNOS;
  private reservasSignal = signal<Reserva[]>([]);
  private isLoadingSignal = signal<boolean>(false);

  // Mock data para desarrollo
  private mockReservas: Reserva[] = [
    {
      id: '1',
      clienteId: '3',
      barberoId: '1',
      servicioId: '1',
      fechaHora: new Date(2024, 11, 30, 10, 0),
      estado: EstadoReserva.CONFIRMADA,
      precio: 25000,
      cliente: { nombre: 'Juan Pérez', telefono: '3004567890' },
      barbero: { nombre: 'Carlos Rodríguez' },
      servicio: { nombre: 'Corte Clásico', duracion: 45, precio: 25000 }
    },
    {
      id: '2',
      clienteId: '3',
      barberoId: '2',
      servicioId: '2',
      fechaHora: new Date(2024, 11, 28, 15, 0),
      estado: EstadoReserva.FINALIZADA,
      precio: 35000,
      cliente: { nombre: 'Juan Pérez', telefono: '3004567890' },
      barbero: { nombre: 'Miguel Torres' },
      servicio: { nombre: 'Corte y Barba', duracion: 60, precio: 35000 }
    }
  ];

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

    return this.http.get<Reserva[]>(this.API_URL).pipe(
      map((data: Reserva[]) => ({ success: true, data } as ApiResponse<Reserva[]>)),
      tap(response => {
        if (response.success && response.data) {
          this.reservasSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        console.error('Error obteniendo reservas:', error);
        this.isLoadingSignal.set(false);
        const mockResponse: ApiResponse<Reserva[]> = { success: false, data: this.mockReservas };
        return of(mockResponse);
      })
    );
  }

  getReservasByCliente(clienteId: string): Observable<ApiResponse<Reserva[]>> {
    this.isLoadingSignal.set(true);
    const url = `${this.API_URL}/cliente/${clienteId}`;
    return this.http.get<Reserva[]>(url).pipe(
      map(data => ({ success: true, data } as ApiResponse<Reserva[]>)),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        console.error('Error obteniendo reservas por cliente:', error);
        this.isLoadingSignal.set(false);
        const fallback = this.mockReservas.filter(r => r.clienteId === clienteId);
        return of({ success: false, data: fallback } as ApiResponse<Reserva[]>);
      })
    );
  }

  getReservasByBarbero(barberoId: string, fecha: Date): Observable<ApiResponse<Reserva[]>> {
    this.isLoadingSignal.set(true);

    const fechaStr = format(fecha, 'yyyy-MM-dd');
    const url = `${this.API_URL}/barbero/${barberoId}`;

    return this.http.get<Reserva[]>(url).pipe(
      map((data: Reserva[]) => {
        const reservasFiltradas = data.filter(r => format(new Date(r.fechaHora), 'yyyy-MM-dd') === fechaStr);
        return { success: true, data: reservasFiltradas } as ApiResponse<Reserva[]>;
      }),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        console.error('Error al obtener reservas por barbero:', error);
        this.isLoadingSignal.set(false);
        const fallbackReservas = this.mockReservas.filter(r => r.barberoId === barberoId && format(r.fechaHora, 'yyyy-MM-dd') === fechaStr);
        return of({ success: false, data: fallbackReservas, message: 'Error de conexión. Mostrando datos de prueba.' } as ApiResponse<Reserva[]>);
      })
    );
  }

  createReserva(reserva: CreateReservaRequest): Observable<ApiResponse<Reserva>> {
    this.isLoadingSignal.set(true);

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const body = {
      clienteId: currentUser.id,
      barberoId: reserva.barberoId,
      servicioId: reserva.servicioId,
      fechaHora: reserva.fechaHora,
      notas: reserva.notas,
      duracionMinutos: (reserva as any).duracionMinutos || 60
    };

    return this.http.post<Reserva>(this.API_URL, body).pipe(
      map((data: Reserva) => ({ success: true, data } as ApiResponse<Reserva>)),
      tap(response => {
        if (response.success && response.data) {
          this.reservasSignal.set([...this.reservasSignal(), response.data]);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        const msg = (error?.error && (error.error.message || error.error.error)) || error.message || 'Error creando reserva';
        this.isLoadingSignal.set(false);
        return of({ success: false, data: null as any, message: msg } as ApiResponse<Reserva>);
      })
    );
  }

  updateReserva(id: string, reserva: UpdateReservaRequest): Observable<ApiResponse<Reserva>> {
    this.isLoadingSignal.set(true);
    
    const index = this.mockReservas.findIndex(r => r.id === id);
    if (index !== -1) {
      this.mockReservas[index] = { 
        ...this.mockReservas[index], 
        ...reserva,
        fechaActualizacion: new Date()
      };
    }

    const mockResponse: ApiResponse<Reserva> = {
      success: index !== -1,
      data: this.mockReservas[index]
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.reservasSignal.set([...this.mockReservas]);
        }
        this.isLoadingSignal.set(false);
      })
    );
  }

  cancelarReserva(id: string): Observable<ApiResponse<Reserva>> {
    this.isLoadingSignal.set(true);
    const url = `${this.API_URL}/${id}/cancelar`;
    return this.http.post<any>(url, {}).pipe(
      map(data => ({ success: true, data: data as Reserva } as ApiResponse<Reserva>)),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        const msg = (error?.error && (error.error.message || error.error.error)) || error.message || 'Error al cancelar';
        this.isLoadingSignal.set(false);
        return of({ success: false, data: null as any, message: msg } as ApiResponse<Reserva>);
      })
    );
  }

  confirmarReserva(id: string): Observable<ApiResponse<Reserva>> {
    this.isLoadingSignal.set(true);
    const url = `${this.API_URL}/${id}/confirmar`;
    return this.http.post<any>(url, {}).pipe(
      map(data => ({ success: true, data: data as Reserva } as ApiResponse<Reserva>)),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        const msg = (error?.error && (error.error.message || error.error.error)) || error.message || 'Error al confirmar';
        this.isLoadingSignal.set(false);
        return of({ success: false, data: null as any, message: msg } as ApiResponse<Reserva>);
      })
    );
  }

  iniciarServicio(id: string): Observable<ApiResponse<Reserva>> {
    this.isLoadingSignal.set(true);
    const url = `${this.API_URL}/${id}/iniciar`;
    return this.http.post<any>(url, {}).pipe(
      map(data => ({ success: true, data: data as Reserva } as ApiResponse<Reserva>)),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        const msg = (error?.error && (error.error.message || error.error.error)) || error.message || 'Error al iniciar';
        this.isLoadingSignal.set(false);
        return of({ success: false, data: null as any, message: msg } as ApiResponse<Reserva>);
      })
    );
  }

  finalizarServicio(id: string): Observable<ApiResponse<Reserva>> {
    this.isLoadingSignal.set(true);
    const url = `${this.API_URL}/${id}/finalizar`;
    return this.http.post<any>(url, {}).pipe(
      map(data => ({ success: true, data: data as Reserva } as ApiResponse<Reserva>)),
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        const msg = (error?.error && (error.error.message || error.error.error)) || error.message || 'Error al finalizar';
        this.isLoadingSignal.set(false);
        return of({ success: false, data: null as any, message: msg } as ApiResponse<Reserva>);
      })
    );
  }

  marcarNoAsistio(id: string): Observable<ApiResponse<Reserva>> {
    this.isLoadingSignal.set(true);
    const url = `http://localhost:8089/api/reservas/${id}/no-asistio`;
    return this.http.post<ApiResponse<Reserva>>(url, {}).pipe(
      tap(response => {
        if (response.success) {
          const reservas = this.reservasSignal();
          const index = reservas.findIndex(r => r.id === id);
          if (index !== -1) {
            reservas[index] = { ...reservas[index], estado: EstadoReserva.NO_ASISTIO };
            this.reservasSignal.set([...reservas]);
          }
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        const msg = (error?.error && (error.error.message || error.error.error)) || error.message || 'Error al actualizar';
        this.isLoadingSignal.set(false);
        return of({ success: false, data: null as any, message: msg });
      })
    );
  }

  getDisponibilidadBarbero(barberoId: string, fechaInicio: Date, dias: number = 7): Observable<ApiResponse<DisponibilidadBarbero>> {
    const fechaInicioStr = format(fechaInicio, 'yyyy-MM-dd');
    const url = `${this.API_URL}/barberos/${barberoId}/disponibilidad?fechaInicio=${fechaInicioStr}&dias=${dias}`;
    return this.http.get<DisponibilidadBarbero>(url).pipe(
      map(data => ({ success: true, data } as ApiResponse<DisponibilidadBarbero>)),
      catchError(error => {
        const msg = (error?.error && (error.error.message || error.error.error)) || error.message || 'Error al obtener disponibilidad del barbero';
        console.error('Error al obtener disponibilidad del barbero:', msg);
        const horarios: HorarioDisponible[] = [];
        for (let i = 0; i < dias; i++) {
          const fecha = addDays(fechaInicio, i);
          const fechaStr = format(fecha, 'yyyy-MM-dd');
          const horasDisponibles = this.generarHorasDisponibles(barberoId, fecha);
          horarios.push({ fecha: fechaStr, horasDisponibles });
        }
        const disponibilidad: DisponibilidadBarbero = { barberoId, horarios };
        return of({ success: false, data: disponibilidad, message: msg } as ApiResponse<DisponibilidadBarbero>);
      })
    );
  }

mapHorasDisponiblesPorFecha(disponibilidad: ApiResponse<DisponibilidadBarbero> | DisponibilidadBarbero | null, fecha: string): string[] {

  if (!disponibilidad) return [];

  // Si viene en formato ApiResponse
  const horarios =
    (disponibilidad as any)?.data?.horarios ??
    (disponibilidad as any)?.horarios ??
    [];

  if (!Array.isArray(horarios)) return [];

  const match = horarios.find((h: HorarioDisponible) => h.fecha === fecha);
  return match?.horasDisponibles ?? [];
}

  private generarHorasDisponibles(barberoId: string, fecha: Date): string[] {
    const horas: string[] = [];
    const horaInicio = 8;
    const horaFin = 18;
    
    const reservasExistentes = this.mockReservas.filter(r => 
      r.barberoId === barberoId && 
      format(r.fechaHora, 'yyyy-MM-dd') === format(fecha, 'yyyy-MM-dd')
    );

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaCompleta = setMinutes(setHours(fecha, hora), minuto);
        const horaStr = format(horaCompleta, 'HH:mm');
        
        const hayConflicto = reservasExistentes.some(reserva => {
          const inicioReserva = reserva.fechaHora;
          const finReserva = new Date(inicioReserva.getTime() + (45 * 60 * 1000));
          
          return (
            (isAfter(horaCompleta, inicioReserva) && isBefore(horaCompleta, finReserva)) ||
            format(horaCompleta, 'HH:mm') === format(inicioReserva, 'HH:mm')
          );
        });

        if (!hayConflicto) {
          horas.push(horaStr);
        }
      }
    }

    return horas;
  }


/**
 * Obtiene la disponibilidad de un barbero
 */

  private loadReservas(): void {
    this.getAllReservas().subscribe();
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of,catchError, map } from 'rxjs'; 
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

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly API_URL = 'http://localhost:8089/turnos';
  private reservasSignal = signal<Reserva[]>([]);
  private isLoadingSignal = signal<boolean>(false);

  // Mock data para desarrollo
  private mockReservas: Reserva[] = [
    {
      id: '1',
      clienteId: '3',
      barberoId: '1',
      servicioId: '1',
      fechaHora: new Date(2024, 11, 30, 10, 0), // 30 dic 2024, 10:00 AM
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
      fechaHora: new Date(2024, 11, 28, 15, 0), // 28 dic 2024, 3:00 PM
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
    
    const mockResponse: ApiResponse<Reserva[]> = {
      success: true,
      data: this.mockReservas
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.reservasSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      })
    );
  }

  getReservasByCliente(clienteId: string): Observable<ApiResponse<Reserva[]>> {
    const reservasCliente = this.mockReservas.filter(r => r.clienteId === clienteId);
    
    return of({
      success: true,
      data: reservasCliente
    });
  }

  getReservasByBarbero(barberoId: string, fecha: Date): Observable<ApiResponse<Reserva[]>> {
    this.isLoadingSignal.set(true);

    const fechaStr = format(fecha, 'yyyy-MM-dd');

    // 1. Define la URL del endpoint para obtener TODAS las citas del barbero (sin filtro de fecha)
    // Usamos 'barbero' en singular según el endpoint proporcionado: @GetMapping("/barbero/{id}")
    const url = `${this.API_URL}/barbero/${barberoId}`;
    console.log(`[HTTP Request Log] Intentando obtener agenda: GET ${url}`);
    // 2. Realiza la petición HTTP GET para TODAS las reservas del barbero
    return this.http.get<ApiResponse<Reserva[]>>(url).pipe(
      map((response: ApiResponse<Reserva[]>) => { // Tipado explícito para 'response'
        this.isLoadingSignal.set(false);
        
        if (response.success && response.data) {
            // 3. Filtramos la lista COMPLETA de reservas devuelta por la API, por la fecha solicitada
            const reservasFiltradas = response.data.filter((r: Reserva) => { // Tipado explícito para 'r'
                // Asumimos que r.fechaHora es un string ISO 8601 del backend.
                return format(new Date(r.fechaHora), 'yyyy-MM-dd') === fechaStr;
            });

            return { 
                ...response, 
                data: reservasFiltradas 
            } as ApiResponse<Reserva[]>;

        }
        return response; // Devuelve la respuesta original (posiblemente con error/sin datos)
      }),
      catchError((error: any) => { // Tipado explícito para 'error'
        console.error('Error al obtener reservas por barbero (llamada completa):', error);
        this.isLoadingSignal.set(false);

        // Si la llamada falla, devolvemos un mock de un subconjunto de reservas
        const fallbackReservas = this.mockReservas.filter(r => 
          r.barberoId === barberoId && 
          format(r.fechaHora, 'yyyy-MM-dd') === fechaStr
        );
        return of({ 
          success: false, 
          data: fallbackReservas, 
          message: 'Error de conexión. Mostrando datos de prueba.' 
        });
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

  return this.http.post<ApiResponse<Reserva>>(this.API_URL, body).pipe(
    tap(response => {
      if (response.success && response.data) {
        // Actualiza estados en Angular
        this.reservasSignal.set([...this.reservasSignal(), response.data]);
      }
      this.isLoadingSignal.set(false);
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
  const url = `http://localhost:8089/turnos/${id}/cancelar`;
  
  return this.http.post<ApiResponse<Reserva>>(url, {}).pipe(
    tap(() => this.isLoadingSignal.set(false)),
    catchError(error => {
      console.error('Error al cancelar:', error);
      this.isLoadingSignal.set(false);
      return of({ success: false, data: null as any, message: 'Error' });
    })
  );
}

confirmarReserva(id: string): Observable<ApiResponse<Reserva>> {
  this.isLoadingSignal.set(true);
  const url = `http://localhost:8089/turnos/${id}/confirmar`;
  
  return this.http.post<ApiResponse<Reserva>>(url, {}).pipe(
    tap(() => this.isLoadingSignal.set(false)),
    catchError(error => {
      console.error('Error al confirmar:', error);
      this.isLoadingSignal.set(false);
      return of({ success: false, data: null as any, message: 'Error' });
    })
  );
}

iniciarServicio(id: string): Observable<ApiResponse<Reserva>> {
  this.isLoadingSignal.set(true);
  const url = `http://localhost:8089/turnos/${id}/iniciar`;
  
  return this.http.post<ApiResponse<Reserva>>(url, {}).pipe(
    tap(() => this.isLoadingSignal.set(false)),
    catchError(error => {
      console.error('Error al iniciar:', error);
      this.isLoadingSignal.set(false);
      return of({ success: false, data: null as any, message: 'Error' });
    })
  );
}

finalizarServicio(id: string): Observable<ApiResponse<Reserva>> {
  this.isLoadingSignal.set(true);
  const url = `http://localhost:8089/turnos/${id}/finalizar`;
  
  return this.http.post<ApiResponse<Reserva>>(url, {}).pipe(
    tap(() => this.isLoadingSignal.set(false)),
    catchError(error => {
      console.error('Error al finalizar:', error);
      this.isLoadingSignal.set(false);
      return of({ success: false, data: null as any, message: 'Error' });
    })
  );
}
marcarNoAsistio(id: string): Observable<ApiResponse<Reserva>> {
  this.isLoadingSignal.set(true);
  
  const url = `http://localhost:8089/api/reservas/${id}/no-asistio`;
  
  return this.http.post<ApiResponse<Reserva>>(url, {}).pipe(
    tap(response => {
      if (response.success) {
        // Actualizar la lista local si es necesario
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
      console.error('Error al marcar no asistió:', error);
      this.isLoadingSignal.set(false);
      return of({ success: false, data: null as any, message: 'Error al actualizar' });
    })
  );
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
    
    // Obtener reservas existentes para esta fecha y barbero
    const reservasExistentes = this.mockReservas.filter(r => 
      r.barberoId === barberoId && 
      format(r.fechaHora, 'yyyy-MM-dd') === format(fecha, 'yyyy-MM-dd')
    );

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaCompleta = setMinutes(setHours(fecha, hora), minuto);
        const horaStr = format(horaCompleta, 'HH:mm');
        
        // Verificar si hay conflicto con reservas existentes
        const hayConflicto = reservasExistentes.some(reserva => {
          const inicioReserva = reserva.fechaHora;
          const finReserva = new Date(inicioReserva.getTime() + (45 * 60 * 1000)); // 45 min por defecto
          
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

  private loadReservas(): void {
    this.getAllReservas().subscribe();
  }
}
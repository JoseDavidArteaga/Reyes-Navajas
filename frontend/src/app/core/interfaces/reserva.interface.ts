export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
  EN_PROGRESO = 'EN_PROGRESO',
  FINALIZADA = 'FINALIZADA',
  NO_ASISTIO = 'NO_ASISTIO'
}

export interface Reserva {
  id: string;
  clienteId: string;
  barberoId: string;
  servicioId: string;
  fechaHora: Date;
  estado: EstadoReserva;
  precio?: number;
  notas?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  
  // Datos relacionados (para mostrar en vistas)
  cliente?: {
    nombre: string;
    telefono: string;
  };
  barbero?: {
    nombre: string;
  };
  servicio?: {
    nombre: string;
    duracion: number;
    precio: number;
  };
}

export interface CreateReservaRequest {
  barberoId: string;
  servicioId: string;
  fechaHora: string; // ISO string
  notas?: string;
}

export interface UpdateReservaRequest {
  estado?: EstadoReserva;
  notas?: string;
}

// Para el wizard de reservas
export interface ReservaWizardData {
  servicio?: string;
  barbero?: string;
  fecha?: string;
  hora?: string;
}

// Para disponibilidad de horarios
export interface HorarioDisponible {
  fecha: string;
  horasDisponibles: string[];
}

export interface DisponibilidadBarbero {
  barberoId: string;
  horarios: HorarioDisponible[];
}
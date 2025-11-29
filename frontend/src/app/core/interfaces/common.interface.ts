// Cola virtual para clientes sin cita (Walk-in)
export enum EstadoCola {
  ESPERANDO = 'ESPERANDO',
  EN_SERVICIO = 'EN_SERVICIO',
  ATENDIDO = 'ATENDIDO',
  CANCELADO = 'CANCELADO'
}

export interface ColaVirtual {
  id: string;
  clienteId: string;
  servicioId?: string;
  barberoPreferido?: string;
  posicion: number;
  tiempoEspera: number; // Tiempo estimado en minutos
  estado: EstadoCola;
  fechaIngreso: Date;
  fechaAtencion?: Date;
  
  // Datos relacionados
  cliente?: {
    nombre: string;
    telefono: string;
  };
  servicio?: {
    nombre: string;
    duracion: number;
  };
}

export interface UnirseColaRequest {
  servicioId?: string;
  barberoPreferido?: string;
}

// Métricas para barberos
export interface MetricasBarbero {
  fecha: Date;
  serviciosCompletados: number;
  ingresosDia: number;
  tiempoPromedioServicio: number;
  calificacionPromedio: number;
  clientesAtendidos: number;
}

// Reportes para administradores
export interface ReporteOcupacion {
  fecha: Date;
  totalReservas: number;
  reservasCompletadas: number;
  reservasCanceladas: number;
  ocupacionPorcentaje: number;
  ingresosTotales: number;
}

export interface ReporteCancelaciones {
  periodo: {
    fechaInicio: Date;
    fechaFin: Date;
  };
  totalCancelaciones: number;
  motivosCancelacion: {
    motivo: string;
    cantidad: number;
  }[];
  cancelacionesPorBarbero: {
    barberoId: string;
    barberoNombre: string;
    cantidad: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
export enum EstadoBarbero {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  OCUPADO = 'OCUPADO',
  DESCANSO = 'DESCANSO'
}

export interface HorarioTrabajo {
  diaSemana: number; // 0 = Domingo, 1 = Lunes, etc.
  horaInicio: string; // Formato HH:mm
  horaFin: string; // Formato HH:mm
  activo: boolean;
}

export interface Barbero {
  id: string;
  nombre: string;
  telefono?: string;
  especialidades: string[];
  estado: EstadoBarbero;
  horario: HorarioTrabajo[];
  fechaContratacion?: Date;
  foto?: string;
  calificacionPromedio?: number;
  totalServicios?: number;
}

export interface CreateBarberoRequest {
  nombre: string;
  telefono?: string;
  especialidades: string[];
  horario: HorarioTrabajo[];
}

export interface UpdateBarberoRequest extends Partial<CreateBarberoRequest> {
  estado?: EstadoBarbero;
}
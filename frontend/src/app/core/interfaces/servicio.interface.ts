export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number; // Duración en minutos (mínimo 45)
  precio: number;
  activo: boolean;
  categoria?: string;
  imagen?: string;
  fechaCreacion?: Date;
}

export interface CreateServicioRequest {
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
  categoria?: string;
}

export interface UpdateServicioRequest extends Partial<CreateServicioRequest> {
  activo?: boolean;
}
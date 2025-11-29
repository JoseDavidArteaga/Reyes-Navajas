export enum UserRole {
  ADMIN = 'ADMIN',
  BARBERO = 'BARBERO',
  CLIENTE = 'CLIENTE'
}

export interface Usuario {
  id: string;
  nombre: string;
  telefono: string;
  rol: UserRole;
  password?: string; // Solo se envía durante el registro/login
  fechaRegistro?: Date;
  activo?: boolean;
}

export interface LoginRequest {
  telefono: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  expiresIn: number;
}

export interface RegisterRequest {
  nombre: string;
  telefono: string;
  password: string;
}
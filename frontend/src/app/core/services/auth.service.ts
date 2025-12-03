import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Usuario, UserRole, LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '../interfaces';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly KEYCLOAK_TOKEN_URL = 'http://localhost:8080/realms/MicroservicesBarber/protocol/openid-connect/token';
  private readonly KEYCLOAK_CLIENT_ID = 'barber-service';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRES_AT_KEY = 'access_token_expires_at';

  // Signals para manejo de estado
  private currentUserSignal = signal<Usuario | null>(this.getUserFromStorage());
  private isLoadingSignal = signal<boolean>(false);

  // Computed signals
  public currentUser = this.currentUserSignal.asReadonly();
  public isLoggedIn = computed(() => this.currentUserSignal() !== null);
  public isLoading = this.isLoadingSignal.asReadonly();
  public userRole = computed(() => this.currentUserSignal()?.rol);
  public isAdmin = computed(() => this.userRole() === UserRole.ADMIN);
  public isBarbero = computed(() => this.userRole() === UserRole.BARBERO);
  public isCliente = computed(() => this.userRole() === UserRole.CLIENTE);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<any> {
    return this.loginWithKeycloak(credentials.username, credentials.password);
  }

  loginWithKeycloak(username: string, password: string): Observable<any> {
    this.isLoadingSignal.set(true);
    
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', this.KEYCLOAK_CLIENT_ID);
    params.append('username', username);
    params.append('password', password);

    return this.http.post<any>(
      this.KEYCLOAK_TOKEN_URL,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).pipe(
      tap(response => {
        this.handleTokenResponse(response);
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        console.error('Error en login con Keycloak:', error);
        throw error;
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) return of(null);

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', this.KEYCLOAK_CLIENT_ID);
    params.append('refresh_token', refreshToken);

    return this.http.post<any>(
      this.KEYCLOAK_TOKEN_URL,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).pipe(
      tap(response => this.handleTokenResponse(response)),
      catchError(error => {
        console.error('Error refrescando token:', error);
        this.logout();
        throw error;
      })
    );
  }

  private handleTokenResponse(response: any): void {
    const accessToken = response.access_token;
    const refreshToken = response.refresh_token;
    const expiresIn = response.expires_in;

    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);

    const expiresAt = Date.now() + (expiresIn * 1000);
    sessionStorage.setItem(this.TOKEN_EXPIRES_AT_KEY, expiresAt.toString());

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const username = payload.preferred_username || payload.username || payload.sub;
      const roles = payload.realm_access?.roles || [];
      
      const usuario: Usuario = {
        id: payload.sub || '0',
        nombre: username,
        telefono: payload.phone_number || username, // Usa phone_number si está disponible, sino username
        rol: this.mapRoles(roles)
      };

      this.currentUserSignal.set(usuario);
      localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
    } catch (err) {
      console.error('Error parseando JWT:', err);
    }
  }

  private mapRoles(roles: string[]): UserRole {
    if (roles.includes('administrador') || roles.includes('admin')) return UserRole.ADMIN;
    else if (roles.includes('barbero')) return UserRole.BARBERO;
    return UserRole.CLIENTE;
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  isTokenExpiringSoon(secondsBefore: number = 60): boolean {
    const expiresAt = sessionStorage.getItem(this.TOKEN_EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    return Date.now() > (parseInt(expiresAt) - (secondsBefore * 1000));
  }

  register(userData: RegisterRequest): Observable<any> {
    this.isLoadingSignal.set(true);
    
    // Transformar datos al formato esperado por el backend
    const requestData = {
      nombre: userData.nombre,
      telefono: userData.telefono,
      contrasenia: userData.password  // 🔑 IMPORTANTE: password → contrasenia
    };

    // Enviar a API Gateway (puerto 8089)
    return this.http.post<any>(
      'http://localhost:8089/usuarios/registro', 
      requestData
    ).pipe(
      tap((response) => {
        this.isLoadingSignal.set(false);
        // Nota: El endpoint de registro NO retorna token JWT
        // Solo retorna los datos del usuario creado
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        console.error('Error en registro:', error);
        throw error;
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_EXPIRES_AT_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSession(loginData: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, loginData.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(loginData.usuario));
    this.currentUserSignal.set(loginData.usuario);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private getUserFromStorage(): Usuario | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        localStorage.removeItem(this.USER_KEY);
      }
    }
    return null;
  }

  isTokenExpired(): boolean {
    const expiresAt = sessionStorage.getItem(this.TOKEN_EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    return Date.now() > parseInt(expiresAt);
  }

  hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const currentRole = this.userRole();
    return currentRole ? roles.includes(currentRole) : false;
  }

  private parseJwtToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return {};
    }
  }
}
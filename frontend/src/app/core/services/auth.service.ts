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

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    this.isLoadingSignal.set(true);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: API_CONFIG.KEYCLOAK_CLIENT_ID,
      username: credentials.telefono,
      password: credentials.password
    });

    return this.http.post<any>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, body.toString(), { headers }).pipe(
      map(keycloakResponse => {
        // Extraer información del token JWT para obtener roles
        const tokenPayload = this.parseJwtToken(keycloakResponse.access_token);
        const roles = tokenPayload.realm_access?.roles || [];
        
        let userRole = UserRole.CLIENTE;
        if (roles.includes('ADMINISTRADOR')) {
          userRole = UserRole.ADMIN;
        } else if (roles.includes('BARBERO')) {
          userRole = UserRole.BARBERO;
        }

        const loginResponse: LoginResponse = {
          token: keycloakResponse.access_token,
          usuario: {
            id: tokenPayload.sub,
            nombre: tokenPayload.preferred_username || credentials.telefono,
            telefono: credentials.telefono,
            rol: userRole
          },
          expiresIn: keycloakResponse.expires_in
        };

        return {
          success: true,
          data: loginResponse
        } as ApiResponse<LoginResponse>;
      }),
      tap(response => {
        if (response.success) {
          this.setSession(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        console.error('Login error:', error);
        let errorMessage = 'Error en el login';
        
        if (error.status === 401) {
          errorMessage = 'Credenciales inválidas';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión. Verificar que Keycloak esté funcionando';
        } else if (error.error?.error_description) {
          errorMessage = error.error.error_description;
        }
        
        return of({
          success: false,
          error: errorMessage,
          data: null as any
        } as ApiResponse<LoginResponse>);
      })
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<Usuario>> {
    this.isLoadingSignal.set(true);
    
    return this.http.post<ApiResponse<Usuario>>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData).pipe(
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return of({
          success: false,
          error: error.error?.message || 'Error en el registro',
          data: null as any
        } as ApiResponse<Usuario>);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<ApiResponse<LoginResponse>> {
    // Mock implementation
    return of({
      success: true,
      data: {
        token: 'refreshed_mock_token_' + Date.now(),
        usuario: this.currentUserSignal()!,
        expiresIn: 3600
      }
    }).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.data.token);
        }
      })
    );
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
    const token = this.getToken();
    if (!token) return true;
    
    // Mock implementation - en producción verificar el JWT
    return false;
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
import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Usuario, UserRole, LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
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
    
    // Mock response para desarrollo
    const mockResponse: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        token: 'mock_jwt_token_' + Date.now(),
        usuario: {
          id: '1',
          nombre: credentials.telefono === '3001234567' ? 'Admin Usuario' : 'Cliente Demo',
          telefono: credentials.telefono,
          rol: credentials.telefono === '3001234567' ? UserRole.ADMIN : 
               credentials.telefono === '3002345678' ? UserRole.BARBERO : UserRole.CLIENTE
        },
        expiresIn: 3600
      }
    };

    return of(mockResponse).pipe(
      tap(response => {
        if (response.success) {
          this.setSession(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        throw error;
      })
    );

    // Implementación real cuando la API esté lista:
    /*
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.setSession(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        throw error;
      })
    );
    */
  }

  register(userData: RegisterRequest): Observable<ApiResponse<Usuario>> {
    this.isLoadingSignal.set(true);
    
    // Mock response para desarrollo
    const mockResponse: ApiResponse<Usuario> = {
      success: true,
      data: {
        id: Date.now().toString(),
        nombre: userData.nombre,
        telefono: userData.telefono,
        rol: UserRole.CLIENTE
      }
    };

    return of(mockResponse).pipe(
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        throw error;
      })
    );

    // Implementación real:
    /*
    return this.http.post<ApiResponse<Usuario>>(`${this.API_URL}/register`, userData).pipe(
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        throw error;
      })
    );
    */
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
}
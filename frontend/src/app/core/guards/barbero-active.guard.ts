import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { UserRole } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class BarberoActiveGuard implements CanActivate {
  private readonly USUARIOS_API_URL = 'http://localhost:8089/usuarios';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  canActivate(): Observable<boolean> {
    const currentUser = this.authService.currentUser();
    
    // Si no hay usuario logueado, redirigir al login
    if (!currentUser) {
      this.router.navigate(['/login']);
      return of(false);
    }

    // Si no es barbero, permitir acceso (este guard solo aplica a barberos)
    if (currentUser.rol !== UserRole.BARBERO) {
      return of(true);
    }

    // Verificar estado del barbero en el backend
    return this.http.get<any>(`${this.USUARIOS_API_URL}/name/${currentUser.nombre}`).pipe(
      map(response => {
        // Si el barbero está activo, permitir acceso
        if (response.estado === true) {
          return true;
        } else {
          // Si está inactivo, redirigir a página de cuenta deshabilitada
          this.router.navigate(['/account-disabled']);
          return false;
        }
      }),
      catchError(error => {
        console.error('Error verificando estado del barbero:', error);
        // En caso de error, por seguridad redirigir a login
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
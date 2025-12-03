import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const barberoActivoGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está logueado
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Si es admin, permitir siempre el acceso
  if (authService.isAdmin()) {
    return true;
  }

  // Si no es barbero, redirigir según corresponda
  if (!authService.isBarbero()) {
    router.navigate(['/cliente/reservar']);
    return false;
  }

  // Si es barbero, verificar su estado
  return authService.verificarEstadoBarbero().pipe(
    map(activo => {
      if (!activo) {
        // Barbero inactivo - redirigir a página de cuenta deshabilitada
        router.navigate(['/barbero/cuenta-deshabilitada']);
        return false;
      }
      return true; // Barbero activo - permitir acceso
    }),
    catchError(error => {
      console.error('Error verificando estado del barbero:', error);
      // En caso de error, permitir el acceso por seguridad
      return of(true);
    })
  );
};
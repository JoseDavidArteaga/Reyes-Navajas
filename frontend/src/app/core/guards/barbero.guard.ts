import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces';

export const barberoGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.hasAnyRole([UserRole.ADMIN, UserRole.BARBERO])) {
    return true;
  }

  // Redirigir al dashboard del cliente
  router.navigate(['/cliente/reservar']);
  return false;
};
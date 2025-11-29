import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.hasRole(UserRole.ADMIN)) {
    return true;
  }

  // Redirigir al dashboard apropiado según el rol
  const userRole = authService.userRole();
  switch (userRole) {
    case UserRole.BARBERO:
      router.navigate(['/barbero/agenda-diaria']);
      break;
    case UserRole.CLIENTE:
      router.navigate(['/cliente/reservar']);
      break;
    default:
      router.navigate(['/login']);
  }
  
  return false;
};
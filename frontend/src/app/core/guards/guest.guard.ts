import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Si ya está logueado, redirigir al dashboard apropiado
  const userRole = authService.userRole();
  switch (userRole) {
    case 'ADMIN':
      router.navigate(['/admin/gestion-barberos']);
      break;
    case 'BARBERO':
      router.navigate(['/barbero/agenda-diaria']);
      break;
    case 'CLIENTE':
      router.navigate(['/cliente/reservar']);
      break;
    default:
      router.navigate(['/']);
  }
  
  return false;
};
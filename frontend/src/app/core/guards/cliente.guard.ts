import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces';

export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.hasRole(UserRole.CLIENTE)) {
    return true;
  }

  // Redirigir al dashboard apropiado según el rol
  const userRole = authService.userRole();
  switch (userRole) {
    case UserRole.ADMIN:
      router.navigate(['/admin/gestion-barberos']);
      break;
    case UserRole.BARBERO:
      router.navigate(['/barbero/agenda-diaria']);
      break;
    default:
      router.navigate(['/login']);
  }
  
  return false;
};
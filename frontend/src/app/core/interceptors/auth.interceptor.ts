import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { API_CONFIG } from '../config/api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Solo agregar el token si la request es para nuestra API Gateway o microservicios
  if (token && (
    req.url.includes('localhost:8089') || // API Gateway
    req.url.includes('localhost:808') ||  // Microservicios
    req.url.startsWith(API_CONFIG.GATEWAY_URL)
  )) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};
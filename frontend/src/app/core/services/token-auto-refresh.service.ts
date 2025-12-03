import { Injectable, NgZone } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenAutoRefreshService {
  private refreshTimer: any;
  private readonly REFRESH_CHECK_INTERVAL = 30000; // Verificar cada 30 segundos

  constructor(
    private authService: AuthService,
    private ngZone: NgZone
  ) {
    this.startAutoRefresh();
  }

  startAutoRefresh(): void {
    // Usar ngZone para evitar que Angular change detection se active constantemente
    this.ngZone.runOutsideAngular(() => {
      this.refreshTimer = setInterval(() => {
        // Verificar si el token va a expirar en los próximos 60 segundos
        if (this.authService.isTokenExpiringSoon(60)) {
          // Cambiar a zona Angular para que la respuesta se procese correctamente
          this.ngZone.run(() => {
            this.authService.refreshToken().subscribe({
              next: (response) => {
                console.log('Token refrescado automáticamente');
              },
              error: (error) => {
                console.error('Error al refrescar token:', error);
                // Si falla el refresh, el usuario será desconectado por logout() en refreshToken()
              }
            });
          });
        }
      }, this.REFRESH_CHECK_INTERVAL);
    });
  }

  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }
}

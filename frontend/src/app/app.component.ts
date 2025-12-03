import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent, FooterComponent } from './shared';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TokenAutoRefreshService } from './core/services/token-auto-refresh.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-barberia-darker">
      <app-navbar></app-navbar>
      
      <main class="flex-1 pt-16">
        <router-outlet></router-outlet>
      </main>
      
      <app-footer></app-footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Reyes & Navajas - Sistema de Gestión de Barbería';
  
  private routerSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private tokenAutoRefreshService: TokenAutoRefreshService
  ) {}

  ngOnInit(): void {
    // Configurar scroll to top global en cambios de ruta
    this.setupGlobalScrollBehavior();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private setupGlobalScrollBehavior(): void {
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event) => {
        // Scroll al top en cada cambio de ruta
        this.scrollToTop();
        console.log('Navegación completada a:', (event as NavigationEnd).url, '- Scroll to top ejecutado');
      });
  }

  private scrollToTop(): void {
    // Método robusto que funciona en todos los navegadores
    try {
      // Scroll suave moderno
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      // Fallback para navegadores más antiguos
      setTimeout(() => {
        document.body.scrollTop = 0; // Safari
        document.documentElement.scrollTop = 0; // Chrome, Firefox, IE, Opera
      }, 100);
      
    } catch (error) {
      // Fallback básico si el método moderno falla
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      console.warn('Fallback scroll method used:', error);
    }
  }
}
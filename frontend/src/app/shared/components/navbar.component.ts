import { Component, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/interfaces';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-barberia-dark border-b border-gray-700 shadow-xl backdrop-blur-sm bg-opacity-95 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo y marca -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center">
              <div class="w-8 h-8 bg-barberia-gold rounded-lg flex items-center justify-center mr-3">
                <span class="text-barberia-dark font-bold text-xl">R</span>
              </div>
              <span class="font-display text-xl font-semibold text-barberia-gold">
                Reyes & Navajas
              </span>
            </a>
          </div>

          <!-- Enlaces de navegación - Desktop -->
          <div class="hidden md:flex items-center space-x-8">
            @if (authService.isLoggedIn()) {
              <!-- Navegación para usuarios autenticados -->
              @if (authService.isAdmin()) {
                <a routerLink="/admin/barberos" routerLinkActive="nav-link-active" class="nav-link">
                  Gestión Barberos
                </a>
                <a routerLink="/admin/servicios" routerLinkActive="nav-link-active" class="nav-link">
                  Servicios
                </a>
                <a routerLink="/admin/reportes" routerLinkActive="nav-link-active" class="nav-link">
                  Reportes
                </a>
              }
              @if (authService.isBarbero()) {
                <a routerLink="/barbero/agenda-diaria" routerLinkActive="nav-link-active" class="nav-link">
                  Agenda
                </a>
                <a routerLink="/barbero/metricas" routerLinkActive="nav-link-active" class="nav-link">
                  Métricas
                </a>
              }
              @if (authService.isCliente()) {
                <a routerLink="/cliente/reservar" routerLinkActive="nav-link-active" class="nav-link">
                  Reservar
                </a>
                <a routerLink="/cliente/mis-reservas" routerLinkActive="nav-link-active" class="nav-link">
                  Mis Reservas
                </a>
                <a routerLink="/cliente/cola-virtual" routerLinkActive="nav-link-active" class="nav-link">
                  Cola Virtual
                </a>
              }
              
              <!-- Usuario y logout -->
              <div class="flex items-center space-x-4">
                <div class="text-sm">
                  <span class="text-gray-300">Hola, </span>
                  <span class="text-barberia-gold font-medium">
                    {{ authService.currentUser()?.nombre }}
                  </span>
                </div>
                <button 
                  (click)="logout()"
                  class="btn-secondary text-sm px-3 py-1">
                  Cerrar Sesión
                </button>
              </div>
            } @else {
              <!-- Navegación para visitantes -->
              @if (isHomePage()) {
                <a class="nav-link cursor-pointer" (click)="scrollToSection('inicio')">
                  Inicio
                </a>
                <a class="nav-link cursor-pointer" (click)="scrollToSection('conocenos')">
                  Conócenos
                </a>
                <a class="nav-link cursor-pointer" (click)="scrollToSection('aqui-estamos')">
                  Aquí estamos
                </a>
              }
              <a routerLink="/login" routerLinkActive="nav-link-active" class="nav-link">
                Iniciar Sesión
              </a>
              <a routerLink="/registro" class="btn-primary">
                Registrarse
              </a>
            }
          </div>

          <!-- Menú móvil hamburger -->
          <div class="md:hidden flex items-center">
            <button 
              (click)="toggleMobileMenu()"
              class="text-gray-400 hover:text-barberia-gold focus:outline-none focus:text-barberia-gold">
              <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path 
                  [attr.class]="!showMobileMenu() ? 'block' : 'hidden'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M4 6h16M4 12h16M4 18h16" />
                <path 
                  [attr.class]="showMobileMenu() ? 'block' : 'hidden'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Menú móvil -->
      <div class="md:hidden" [class.hidden]="!showMobileMenu()">
        <div class="px-2 pt-2 pb-3 space-y-1 bg-gray-800 border-t border-gray-700">
          @if (authService.isLoggedIn()) {
            <!-- Usuario info en móvil -->
            <div class="px-3 py-2 border-b border-gray-700 mb-2">
              <div class="text-sm text-gray-300">Hola, </div>
              <div class="text-barberia-gold font-medium">
                {{ authService.currentUser()?.nombre }}
              </div>
            </div>

            @if (authService.isAdmin()) {
              <a routerLink="/admin/barberos" 
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold">
                Gestión Barberos
              </a>
              <a routerLink="/admin/servicios" 
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold">
                Servicios
              </a>
              <a routerLink="/admin/reportes" 
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold">
                Reportes
              </a>
            }
            @if (authService.isBarbero()) {
              <a routerLink="/barbero/agenda-diaria" 
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold">
                Agenda
              </a>
              <a routerLink="/barbero/metricas" 
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold">
                Métricas
              </a>
            }
            @if (authService.isCliente()) {
              <a routerLink="/cliente/reservar" 
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold">
                Reservar
              </a>
              <a routerLink="/cliente/mis-reservas" 
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold">
                Mis Reservas
              </a>
              <a routerLink="/cliente/cola-virtual" 
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold">
                Cola Virtual
              </a>
            }
            
            <button 
              (click)="logout()"
              class="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300">
              Cerrar Sesión
            </button>
          } @else {
            @if (isHomePage()) {
              <a (click)="scrollToSection('inicio')"
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold cursor-pointer">
                Inicio
              </a>
              <a (click)="scrollToSection('conocenos')"
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold cursor-pointer">
                Conócenos
              </a>
              <a (click)="scrollToSection('aqui-estamos')"
                 class="block px-3 py-2 text-gray-300 hover:text-barberia-gold cursor-pointer">
                Aquí estamos
              </a>
            }
            <a routerLink="/login" 
               class="block px-3 py-2 text-gray-300 hover:text-barberia-gold">
              Iniciar Sesión
            </a>
            <a routerLink="/registro" 
               class="block px-3 py-2 text-barberia-gold hover:text-barberia-goldLight">
              Registrarse
            </a>
          }
        </div>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {
  public showMobileMenu = signal(false);
  public isHomePage = signal(true);
  private destroy$ = new Subject<void>();
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar la ruta inicial
    this.updateHomePage(this.router.url);
    
    // Suscribirse a los cambios de navegación
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.updateHomePage((event as NavigationEnd).urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateHomePage(url: string): void {
    this.isHomePage.set(url === '/' || url === '');
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.set(!this.showMobileMenu());
  }

  scrollToSection(sectionId: string): void {
    // Cerrar el menú móvil si está abierto
    this.showMobileMenu.set(false);
    
    // Hacer scroll a la sección
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = 64; // altura del navbar (h-16 = 64px)
        const elementPosition = element.offsetTop - navbarHeight;
        
        window.scrollTo({ 
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  logout(): void {
    this.authService.logout();
  }
}
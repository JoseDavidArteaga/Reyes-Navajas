import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-900">
      <div class="lg:flex">
        <!-- Sidebar móvil toggle -->
        <div class="lg:hidden flex items-center justify-between bg-gray-800 p-4">
          <h2 class="text-barberia-gold font-bold text-lg">Admin Panel</h2>
          <button
            (click)="toggleSidebar()"
            class="text-gray-400 hover:text-barberia-gold p-2">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Sidebar -->
        <aside 
          [class]="sidebarOpen() ? 'block' : 'hidden'"
          class="fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 lg:static lg:block lg:z-auto">
          <div class="p-6">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-10 h-10 bg-barberia-gold rounded-lg flex items-center justify-center">
                <span class="text-gray-900 font-bold">A</span>
              </div>
              <div>
                <h2 class="text-barberia-gold font-bold text-lg">Admin Panel</h2>
                <p class="text-gray-400 text-sm">Reyes & Navajas</p>
              </div>
            </div>
            
            <nav class="space-y-2">
              @for (item of menuItems; track item.label) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-barberia-gold/10 text-barberia-gold border-barberia-gold"
                  class="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-barberia-gold transition-colors border-l-4 border-transparent">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path [attr.d]="item.iconPath"></path>
                  </svg>
                  <span>{{ item.label }}</span>
                </a>
              }
            </nav>
          </div>
        </aside>

        <!-- Overlay para móvil -->
        @if (sidebarOpen()) {
          <div 
            (click)="closeSidebar()"
            class="fixed inset-0 bg-gray-900/50 z-20 lg:hidden">
          </div>
        }

        <!-- Main content -->
        <main class="flex-1">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);

  menuItems = [
    {
      label: 'Gestión de Barberos',
      route: '/admin/barberos',
      iconPath: 'M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z'
    },
    {
      label: 'Gestión de Servicios',
      route: '/admin/servicios',
      iconPath: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
    },
    {
      label: 'Reportes',
      route: '/admin/reportes',
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    }
  ];

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}
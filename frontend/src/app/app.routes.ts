import { Routes } from '@angular/router';
import { authGuard, adminGuard, barberoGuard, clienteGuard, guestGuard } from './core';
import { BarberoActiveGuard } from './core/guards/barbero-active.guard';

export const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  // Rutas públicas
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },

  // Ruta para cuenta deshabilitada
  {
    path: 'account-disabled',
    loadComponent: () => import('./features/auth/account-disabled/account-disabled.component').then(m => m.AccountDisabledComponent)
  },

  // Rutas protegidas - Cliente
  {
    path: 'cliente',
    canActivate: [authGuard, clienteGuard],
    children: [
      {
        path: 'reservar',
        loadComponent: () => import('./features/cliente/reservar.component').then(m => m.ReservarComponent)
      },
      {
        path: 'mis-reservas',
        loadComponent: () => import('./features/cliente/mis-reservas.component').then(m => m.MisReservasComponent)
      },
      {
        path: 'cola-virtual',
        loadComponent: () => import('./features/cliente/cola-virtual.component').then(m => m.ColaVirtualComponent)
      },
      { path: '', redirectTo: 'reservar', pathMatch: 'full' }
    ]
  },

  // Rutas protegidas - Barbero
  {
    path: 'barbero',
    canActivate: [authGuard, barberoGuard, BarberoActiveGuard],
    children: [
      {
        path: 'agenda-diaria',
        loadComponent: () => import('./features/barbero/agenda-diaria.component').then(m => m.AgendaDiariaComponent)
      },
      {
        path: 'metricas',
        loadComponent: () => import('./features/barbero/metricas.component').then(m => m.MetricasComponent)
      },
      { path: '', redirectTo: 'agenda-diaria', pathMatch: 'full' }
    ]
  },

  // Rutas protegidas - Administrador
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'barberos',
        loadComponent: () => import('./features/admin/gestion-barberos.component').then(m => m.GestionBarberosComponent)
      },
      {
        path: 'servicios',
        loadComponent: () => import('./features/admin/gestion-servicios.component').then(m => m.GestionServiciosComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/admin/reportes.component').then(m => m.ReportesComponent)
      },
      { path: '', redirectTo: 'barberos', pathMatch: 'full' }
    ]
  },

  // Ruta 404
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
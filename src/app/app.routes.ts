import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { Shell } from './shell/shell/shell';

export const routes: Routes = [
  // Auth (public)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routes').then(m => m.AUTH_ROUTES)
  },

  // Authenticated shell — all protected pages live inside here
  {
    path: '',
    loadComponent: () => import('./shell/shell/shell').then(m => m.Shell),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard-routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'jobs',
        loadChildren: () => import('./jobs/jobs-routes').then(m => m.JOBS_ROUTES)
      },
      {
        path: 'ai',
        loadChildren: () => import('./ai/ai-routes').then(m => m.AI_ROUTES)
      },
      {
        path: 'applications',
        loadChildren: () => import('./applications/applications-routes').then(m => m.APPLICATIONS_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile-routes').then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'preferences',
        loadChildren: () => import('./preferences/preferences-routes').then(m => m.PREFERENCES_ROUTES)
      },
      // Default authenticated redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/auth/login' }
];

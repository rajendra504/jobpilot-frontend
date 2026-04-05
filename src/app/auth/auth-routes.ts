import { Routes } from '@angular/router';
import { guestGuard } from '../core/guards/auth-guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login').then(m => m.Login)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./register/register').then(m => m.Register)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

import { Routes } from '@angular/router';
export const APPLICATIONS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./application-logs/application-logs').then(m => m.ApplicationLogs) }
];

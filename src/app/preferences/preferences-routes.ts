import { Routes } from '@angular/router';
export const PREFERENCES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./preferences-form/preferences-form').then(m => m.PreferencesForm) }
];

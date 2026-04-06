import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile-form/profile-form').then(m => m.ProfileForm)
  },
  {
    path: 'resume',
    loadComponent: () => import('./resume-list/resume-list').then(m => m.ResumeList)
  },
  {
    path: 'credentials',
    loadComponent: () => import('./portal-credentials/portal-credentials').then(m => m.PortalCredentials)
  },
  {
    path: 'sessions',
    loadComponent: () => import('./session-manager/session-manager').then(m => m.SessionManager)
  }
];

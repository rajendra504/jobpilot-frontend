import { Routes } from '@angular/router';
export const AI_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./analysis-list/analysis-list').then(m => m.AnalysisList) },
  { path: ':id', loadComponent: () => import('./analysis-detail/analysis-detail').then(m => m.AnalysisDetail) }
];

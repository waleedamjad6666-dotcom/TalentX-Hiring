import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'admin',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard, roleGuard('Admin')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'candidates', loadComponent: () => import('./features/admin/admin-candidates/admin-candidates.component').then(m => m.AdminCandidatesComponent) },
      { path: 'interviews', loadComponent: () => import('./features/admin/admin-interviews/admin-interviews.component').then(m => m.AdminInterviewsComponent) },
      { path: 'schedule', loadComponent: () => import('./features/admin/admin-schedule/admin-schedule.component').then(m => m.AdminScheduleComponent) },
      { path: 'settings', loadComponent: () => import('./features/admin/admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent) }
    ]
  },
  {
    path: 'interviewer',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard, roleGuard('Interviewer')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/interviewer/interviewer-dashboard/interviewer-dashboard.component').then(m => m.InterviewerDashboardComponent) },
      { path: 'interviews', loadComponent: () => import('./features/interviewer/interviewer-interviews/interviewer-interviews.component').then(m => m.InterviewerInterviewsComponent) },
      { path: 'history', loadComponent: () => import('./features/interviewer/interviewer-history/interviewer-history.component').then(m => m.InterviewerHistoryComponent) },
      { path: 'feedback/:id', loadComponent: () => import('./features/interviewer/interviewer-feedback/interviewer-feedback.component').then(m => m.InterviewerFeedbackComponent) },
      { path: 'candidate-details/:id', loadComponent: () => import('./features/interviewer/candidate-details/candidate-details.component').then(m => m.CandidateDetailsComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

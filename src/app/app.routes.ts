import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  {
    path: 'admin',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard, roleGuard('Admin')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'candidates', loadComponent: () => import('./admin/admin-candidates.component').then(m => m.AdminCandidatesComponent) },
      { path: 'schedule', loadComponent: () => import('./admin/admin-schedule.component').then(m => m.AdminScheduleComponent) }
    ]
  },
  {
    path: 'interviewer',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard, roleGuard('Interviewer')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./interviewer/interviewer-dashboard/interviewer-dashboard.component').then(m => m.InterviewerDashboardComponent) },
      { path: 'feedback/:id', loadComponent: () => import('./interviewer/interviewer-feedback/interviewer-feedback.component').then(m => m.InterviewerFeedbackComponent) },
      { path: 'candidate-details/:id', loadComponent: () => import('./interviewer/candidate-details/candidate-details.component').then(m => m.CandidateDetailsComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  auth = inject(AuthService);
  router = inject(Router);
  mobileMenuOpen = false;

  navLinks = computed(() => {
    const role = this.auth.currentUser()?.role?.toLowerCase();
    if (role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
        { path: '/admin/candidates', label: 'Candidates', icon: 'group' },
        { path: '/admin/interviews', label: 'Feedbacks', icon: 'assignment' },
        { path: '/admin/vacancies', label: 'Vacancies', icon: 'work' },
        { path: '/admin/settings', label: 'Settings', icon: 'settings' }
      ];
    } else {
      return [
        { path: '/interviewer/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
        { path: '/interviewer/interviews', label: 'Interviews', icon: 'event' },
        { path: '/interviewer/history', label: 'History', icon: 'history' }
      ];
    }
  });

  initials = computed(() => {
    const name = this.auth.currentUser()?.name || '';
return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  });

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-[#0d0d0d] text-white font-sans overflow-hidden selection:bg-[#FBBF24]/30">
      <!-- Sidebar (Desktop) / Hidden on mobile unless toggled -->
      <aside class="hidden md:flex w-[260px] bg-[#111111] border-r border-[#262626] flex-col justify-between z-20 shadow-2xl">
        <div>
          <div class="px-6 pt-6 pb-4">
            <h1 class="text-3xl font-extrabold text-[#FBBF24] tracking-tight">TALENTX</h1>
          </div>
          <nav class="mt-4 flex flex-col gap-1.5 px-4">
            @for (link of navLinks(); track link.path) {
              <a [routerLink]="link.path" routerLinkActive="bg-[#1a1a1a] text-[#FBBF24] font-medium border-l-2 border-[#FBBF24]" [routerLinkActiveOptions]="{exact: false}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-[#1a1a1a] hover:text-white transition-all border-l-2 border-transparent">
                 <span class="material-icons text-[22px]">{{ link.icon }}</span>
                 <span class="text-sm tracking-wide">{{ link.label }}</span>
              </a>
            }
          </nav>
        </div>
        <div class="p-5 border-t border-[#262626] flex items-center gap-3 bg-[#0a0a0a]/50">
           <div class="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center font-bold text-sm text-[#FBBF24] shadow-inner">
             {{ initials() }}
           </div>
           <div class="flex-1 min-w-0">
             <div class="font-semibold text-sm text-neutral-200 truncate">{{ auth.currentUser()?.name }}</div>
             <div class="text-xs text-neutral-500 font-medium truncate">{{ auth.currentUser()?.role }}</div>
           </div>
           <button (click)="logout()" class="text-neutral-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10">
             <span class="material-icons text-[20px]">logout</span>
           </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden relative">
        <!-- Mobile Header -->
        <header class="md:hidden flex items-center justify-between p-4 bg-[#111111] border-b border-[#262626] z-30 relative">
          <h1 class="text-2xl font-extrabold text-[#FBBF24] tracking-tight">TALENTX</h1>
          <button class="text-neutral-400 p-2 rounded-lg bg-[#1a1a1a]" (click)="mobileMenuOpen = !mobileMenuOpen">
             <span class="material-icons">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
          </button>
        </header>

        <!-- Mobile Menu Dropdown -->
        @if (mobileMenuOpen) {
          <div class="md:hidden absolute top-[73px] left-0 right-0 bottom-0 bg-[#0d0d0d]/95 backdrop-blur-md z-40 flex flex-col p-6 border-t border-[#262626]">
            @for (link of navLinks(); track link.path) {
              <a [routerLink]="link.path" (click)="mobileMenuOpen = false" class="py-4 text-neutral-200 text-lg font-medium border-b border-[#262626] flex items-center gap-4">
                <span class="material-icons text-[#FBBF24]">{{ link.icon }}</span> {{ link.label }}
              </a>
            }
            <button (click)="logout()" class="py-4 text-red-400 text-left mt-2 flex items-center gap-4 font-medium text-lg">
               <span class="material-icons">logout</span> Logout
            </button>
          </div>
        }

        <div class="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
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

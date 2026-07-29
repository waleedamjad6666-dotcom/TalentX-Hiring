import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div class="bg-[#111111] p-10 rounded-3xl border border-[#262626] w-full max-w-md shadow-2xl">
        <div class="text-center mb-10">
           <h1 class="text-4xl font-extrabold text-[#FBBF24] tracking-tight">TALENTX</h1>
           <p class="text-neutral-500 text-sm mt-2 font-medium">Recruitment Command Center</p>
        </div>

        @if (errorMsg) {
          <div class="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">
            {{ errorMsg }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="login()" class="space-y-6">
          <div>
            <label class="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input type="email" formControlName="email" class="w-full bg-[#161616] border border-[#262626] rounded-xl py-3.5 px-5 text-white outline-none focus:border-[#FBBF24] transition-colors" placeholder="e.g. admin@talentx.com">
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input type="password" formControlName="password" class="w-full bg-[#161616] border border-[#262626] rounded-xl py-3.5 px-5 text-white outline-none focus:border-[#FBBF24] transition-colors" placeholder="e.g. password">
          </div>
          <button type="submit" [disabled]="!loginForm.valid" class="w-full bg-[#FBBF24] hover:bg-[#FACC15] text-black font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] disabled:opacity-50">
            Sign In
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true })
  });

  errorMsg = '';

  login() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue();

      this.auth.login(credentials).subscribe({
        next: () => {
          this.errorMsg = '';
          const role = this.auth.currentUser()?.role?.toLowerCase();
          if (role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/interviewer/dashboard']);
          }
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Invalid email or password.';
        }
      });
    }
  }
}
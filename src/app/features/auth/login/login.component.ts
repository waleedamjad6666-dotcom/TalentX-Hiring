import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html'
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

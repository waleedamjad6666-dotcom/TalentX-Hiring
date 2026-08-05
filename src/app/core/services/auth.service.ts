import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { CurrentUser, LoginResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  currentUser = signal<CurrentUser | null>(null);
  token = signal<string | null>(null);

  constructor() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      this.token.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>('/api/auth/login', credentials).pipe(
      tap(res => {
        this.token.set(res.token);
        this.currentUser.set(res.user);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

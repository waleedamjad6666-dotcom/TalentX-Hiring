import { Injectable, signal } from '@angular/core';

export type Role = 'Admin' | 'Interviewer' | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<{ name: string; role: Role } | null>(null);

  login(role: Role, name: string) {
    this.currentUser.set({ name, role });
  }

  logout() {
    this.currentUser.set(null);
  }
}

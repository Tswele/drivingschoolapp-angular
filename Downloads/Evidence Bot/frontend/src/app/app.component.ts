import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { User } from './models/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private auth = inject(AuthService);
  currentUser: User | null = this.auth.currentUser();
  showAuthModal = signal(false);
  authMode: 'login' | 'signup' = 'login';
  authError = '';
  authForm = { fullName: '', email: '', phone: '', password: '' };

  constructor() {
    this.auth.currentUser$.subscribe(u => (this.currentUser = u));
  }

  get isAdmin(): boolean {
    return (this.currentUser?.role || '').toUpperCase() === 'ADMIN' || localStorage.getItem('adminAuth') === 'true';
  }

  openAuth(mode: 'login' | 'signup') {
    this.authMode = mode;
    this.authError = '';
    this.showAuthModal.set(true);
  }

  closeAuth() {
    this.showAuthModal.set(false);
    this.authError = '';
  }

  submitAuth() {
    this.authError = '';
    if (this.authMode === 'login') {
      this.auth.login(this.authForm.email, this.authForm.password).subscribe({
        next: user => {
          this.auth.setUser(user);
          this.closeAuth();
        },
        error: () => (this.authError = 'Login failed')
      });
    } else {
      this.auth.signup(this.authForm.fullName, this.authForm.email, this.authForm.phone, this.authForm.password).subscribe({
        next: user => {
          this.auth.setUser(user);
          this.closeAuth();
        },
        error: () => (this.authError = 'Sign up failed')
      });
    }
  }

  logout() {
    this.auth.setUser(null);
  }
}


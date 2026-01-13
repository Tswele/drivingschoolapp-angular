import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedOut: boolean | undefined;

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  login(email: string, password: string) {
  this.isLoggedOut = false; // reset isLoggedOut after successful login

    return this.http.post<User>(`${this.baseUrl}/login`, { email, password });
  }

  signup(fullName: string, email: string, phone: string, password: string) {
    return this.http.post<User>(`${this.baseUrl}/signup`, { fullName, email, phone, password });
  }

  setUser(user: User | null) {
    this.currentUserSubject.next(user);
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
  }

  currentUser(): User | null {
    return this.currentUserSubject.value;
  }
}


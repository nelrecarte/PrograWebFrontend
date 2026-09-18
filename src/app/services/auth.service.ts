import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Role } from '../models/auth.model';
import { UserProfile } from '../models/user.model';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  user = signal<UserProfile | null>(this.readUser());

  login(data: LoginRequest): Observable<UserProfile> {
    return this.http.post<AuthResponse>(this.apiUrl + '/auth/login', data).pipe(
      tap((res) => localStorage.setItem(TOKEN_KEY, res.idToken)),
      switchMap(() => this.loadProfile()),
    );
  }

  register(data: RegisterRequest): Observable<UserProfile> {
    return this.http.post<AuthResponse>(this.apiUrl + '/auth/register', data).pipe(
      tap((res) => localStorage.setItem(TOKEN_KEY, res.idToken)),
      switchMap(() => this.loadProfile()),
    );
  }

  forgotPassword(email: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(this.apiUrl + '/auth/forgot-password', { email });
  }

  loadProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl + '/users/me').pipe(
      tap((profile) => {
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        this.user.set(profile);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(TOKEN_KEY) !== null;
  }

  role(): Role | null {
    return this.user()?.role ?? null;
  }

  isAdmin(): boolean {
    return this.role() === 'Administrador';
  }

  isTecnico(): boolean {
    return this.role() === 'Tecnico';
  }

  userId(): string {
    return this.user()?.id ?? '';
  }

  displayName(): string {
    return this.user()?.displayName || this.user()?.email || '';
  }

  homeFor(role: Role): string {
    if (role === 'Administrador') {
      return '/admin';
    }
    if (role === 'Tecnico') {
      return '/tecnico';
    }
    return '/inicio';
  }

  private readUser(): UserProfile | null {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) {
      return null;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
}

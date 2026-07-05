import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TourService } from './tour.service';
import { TourLogService } from './tour-log.service';

interface AuthResponse {
  token: string;
  username: string;
  email: string;
  expiresAt: string;
}

export interface User {
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private injector = inject(Injector);

  private readonly tokenKey = 'authToken';
  private readonly loggedInUserKey = 'loggedInUser';

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        sessionStorage.setItem(this.tokenKey, res.token);
        sessionStorage.setItem(this.loggedInUserKey, JSON.stringify({ username: res.username, email: res.email }));
        this.injector.get(TourLogService).clear();
        this.injector.get(TourService).loadAll();
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  register(email: string, username: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, username, password }).pipe(
      tap(res => {
        sessionStorage.setItem(this.tokenKey, res.token);
        sessionStorage.setItem(this.loggedInUserKey, JSON.stringify({ username: res.username, email: res.email }));
        this.injector.get(TourLogService).clear();
        this.injector.get(TourService).loadAll();
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.loggedInUserKey);
    this.injector.get(TourService).clear();
    this.injector.get(TourLogService).clear();
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    const stored = sessionStorage.getItem(this.loggedInUserKey);
    return stored ? JSON.parse(stored) : null;
  }

  updateProfile(username: string): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/me`, { username }).pipe(
      tap(res => {
        sessionStorage.setItem(this.loggedInUserKey, JSON.stringify({ username: res.username, email: res.email }));
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/users/me/password`, { currentPassword, newPassword });
  }
}
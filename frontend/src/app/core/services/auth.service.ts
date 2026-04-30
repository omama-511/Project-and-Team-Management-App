import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  initializeAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token) return of(null);

    // Rehydrate the user BehaviorSubject from the server
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(() => {
        // Token is corrupted or expired - purge it silently
        localStorage.removeItem('auth_token');
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  login(credentials: { email: string, password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && res.access_token) {
          localStorage.setItem('auth_token', res.access_token);
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  register(userData: { name: string, email: string, password: string }) {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  logout() {
    // Attempt to kill token actively on server
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null)),
      tap(() => {
        // Wipe our strict token
        localStorage.removeItem('auth_token');

        // Wipe all legacy orphaned tokens from older versions
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');

        this.currentUserSubject.next(null);
      })
    );
  }

  getUsers() {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  updateUserRole(userId: number, role: string) {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  updateProfile(userData: any) {
    return this.http.put<any>(`${this.apiUrl}/profile`, userData).pipe(
      tap(res => {
        if (res && res.user) {
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }
}

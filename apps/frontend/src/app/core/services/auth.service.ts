import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly TOKEN_KEY = 'auth_token';

  login(username: string, password: string) {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/api/auth/login`, { username, password })
      .pipe(
        tap(res => localStorage.setItem(this.TOKEN_KEY, res.token)),
        map(() => void 0)
      );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

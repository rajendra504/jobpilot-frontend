import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService, ApiResponse } from './api-service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface RegisterResponse {
  userId: number;
  fullName: string;
  email: string;
}

const TOKEN_KEY = 'jp_token';
const USER_KEY = 'jp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<LoginResponse | null>(this.loadUser());

  readonly user = this._user.asReadonly();

  constructor(private api: ApiService, private router: Router) { }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  login(payload: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.api.post<LoginResponse>('/auth/login', payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem(TOKEN_KEY, res.data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          this._user.set(res.data);
        }
      })
    );
  }

  register(payload: RegisterRequest): Observable<ApiResponse<RegisterResponse>> {
    return this.api.post<RegisterResponse>('/auth/register', payload);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  private loadUser(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

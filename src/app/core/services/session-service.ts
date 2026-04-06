import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api-service';

export interface SessionStatus {
  linkedin: boolean;
  naukri: boolean;
  pendingInit: boolean;
}

export interface SessionInitResponse {
  instruction: string;
  portal: string;
  loginUrl: string;
  nextStep: string;
}

export interface SessionConfirmResponse {
  portal: string;
  status: string;
  validForDays: string;
  nextStep: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private api: ApiService) { }
  
  initSession(portal: string): Observable<ApiResponse<SessionInitResponse>> {
    return this.api.post<SessionInitResponse>(`/sessions/init?portal=${portal}`);
  }

  confirmSession(portal: string): Observable<ApiResponse<SessionConfirmResponse>> {
    return this.api.post<SessionConfirmResponse>(`/sessions/confirm?portal=${portal}`);
  }

  getStatus(): Observable<ApiResponse<SessionStatus>> {
    return this.api.get<SessionStatus>('/sessions/status');
  }

  clearSession(portal: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/sessions/${portal}`);
  }
}

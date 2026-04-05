import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api-service';

export interface RunResult {
  applied: number;
  failed: number;
  manualRequired: number;
  skipped: number;
}

export interface ApplicationLogResponse {
  id: number;
  jobListingId: number;
  jobTitle: string;
  companyName: string;
  portal: string | null;
  status: string;
  aiDecision: string;
  matchScore: number;
  appliedAt: string;
  failureReason: string;
  manualApplyUrl: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RunnerService {
  constructor(private api: ApiService) { }

  run(): Observable<ApiResponse<RunResult>> {
    return this.api.post<RunResult>('/runner/run');
  }

  getLogs(status?: string): Observable<ApiResponse<ApplicationLogResponse[]>> {
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    return this.api.get<ApplicationLogResponse[]>('/runner/logs', params);
  }

  getStats(): Observable<ApiResponse<Record<string, number>>> {
    return this.api.get<Record<string, number>>('/runner/stats');
  }
}

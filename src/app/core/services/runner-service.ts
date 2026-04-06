import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse, Page } from './api-service';

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

  getLogs(params: {
    status?: string;
    page?: number;
    size?: number;
  } = {}): Observable<ApiResponse<Page<ApplicationLogResponse>>> {
    const p: Record<string, string | number> = {};
    if (params.status) p['status'] = params.status;
    p['page'] = params.page ?? 0;
    p['size'] = params.size ?? 20;
    return this.api.get<Page<ApplicationLogResponse>>('/runner/logs', p);
  }

  getStats(): Observable<ApiResponse<Record<string, number>>> {
    return this.api.get<Record<string, number>>('/runner/stats');
  }
}

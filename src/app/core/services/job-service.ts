import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse, Page } from './api-service';

export interface JobListingResponse {
  id: number;
  portal: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobUrl: string;
  description: string;
  salaryRange: string;
  experienceRequired: string;
  jobType: string;
  isEasyApply: boolean;
  status: string;
  scrapedAt: string;
  appliedAt: string;
  createdAt: string;
}

export interface ScrapeResultSummary {
  ran: boolean;
  newSaved: number;
  duplicatesSkipped: number;
  skipReason: string;
}

@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private api: ApiService) { }

  scrape(): Observable<ApiResponse<ScrapeResultSummary>> {
    return this.api.post<ScrapeResultSummary>('/jobs/scrape');
  }

  getListings(params: {
    status?: string;
    portal?: string;
    page?: number;
    size?: number;
  }): Observable<ApiResponse<Page<JobListingResponse>>> {
    const p: Record<string, string | number | boolean> = {};
    if (params.status) p['status'] = params.status;
    if (params.portal) p['portal'] = params.portal;
    p['page'] = params.page ?? 0;
    p['size'] = params.size ?? 20;
    return this.api.get<Page<JobListingResponse>>('/jobs', p);
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<JobListingResponse>> {
    return this.api.patch<JobListingResponse>(`/jobs/${id}/status`, null, { status });
  }
}

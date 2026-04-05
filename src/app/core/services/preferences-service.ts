import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api-service';

export interface JobPreferencesRequest {
  desiredRoles: string[];
  preferredLocations: string[];
  jobTypes?: string[];
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  dailyApplyLimit?: number;
  autoApplyEnabled?: boolean;
  experienceLevel?: string;
  preferredIndustries?: string[];
  noticePeriodDays?: number;
  openToRemote?: boolean;
  openToHybrid?: boolean;
  openToRelocation?: boolean;
}

export interface JobPreferencesResponse {
  id: number;
  userId: number;
  desiredRoles: string[];
  preferredLocations: string[];
  jobTypes: string[];
  minSalary: number;
  maxSalary: number;
  currency: string;
  experienceLevel: string;
  preferredIndustries: string[];
  noticePeriodDays: number;
  openToRemote: boolean;
  openToHybrid: boolean;
  openToRelocation: boolean;
  active: boolean;
  dailyApplyLimit: number;
  autoApplyEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  constructor(private api: ApiService) { }

  saveOrUpdate(body: JobPreferencesRequest): Observable<ApiResponse<JobPreferencesResponse>> {
    return this.api.post<JobPreferencesResponse>('/users/preferences', body);
  }

  get(): Observable<ApiResponse<JobPreferencesResponse>> {
    return this.api.get<JobPreferencesResponse>('/users/preferences');
  }

  delete(): Observable<ApiResponse<void>> {
    return this.api.delete<void>('/users/preferences');
  }
}

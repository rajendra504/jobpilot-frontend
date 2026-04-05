import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api-service';

export interface EducationDto {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  gpa: number | null;
}

export interface ExperienceDto {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface QaPairDto {
  question: string;
  answer: string;
}

export interface PortalCredentialDto {
  portal: string;
  username: string;
  password: string;
}

export interface UserProfileRequest {
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  skills?: string[];
  languages?: string[];
  education?: EducationDto[];
  experience?: ExperienceDto[];
  qaBank?: QaPairDto[];
}

export interface UserProfileResponse {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  skills: string[];
  languages: string[];
  education: EducationDto[];
  experience: ExperienceDto[];
  qaBank: QaPairDto[];
  connectedPortals: string[];
  completenessScore: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private api: ApiService) { }

  createProfile(body: UserProfileRequest): Observable<ApiResponse<UserProfileResponse>> {
    return this.api.post<UserProfileResponse>('/users/profile', body);
  }

  getProfile(): Observable<ApiResponse<UserProfileResponse>> {
    return this.api.get<UserProfileResponse>('/users/profile');
  }

  updateProfile(body: UserProfileRequest): Observable<ApiResponse<UserProfileResponse>> {
    return this.api.put<UserProfileResponse>('/users/profile', body);
  }

  deleteProfile(): Observable<ApiResponse<void>> {
    return this.api.delete<void>('/users/profile');
  }

  saveCredential(dto: PortalCredentialDto): Observable<ApiResponse<UserProfileResponse>> {
    return this.api.post<UserProfileResponse>('/users/profile/credentials', dto);
  }

  removeCredential(portal: string): Observable<ApiResponse<UserProfileResponse>> {
    return this.api.delete<UserProfileResponse>(`/users/profile/credentials/${portal}`);
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api-service';

export interface ResumeResponse {
  id: number;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  primary: boolean;
  textPreview: string;
  textExtracted: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ResumeService {
  constructor(private api: ApiService) { }

  upload(file: File): Observable<ApiResponse<ResumeResponse>> {
    const fd = new FormData();
    fd.append('file', file);
    return this.api.postForm<ResumeResponse>('/resumes/upload', fd);
  }

  list(): Observable<ApiResponse<ResumeResponse[]>> {
    return this.api.get<ResumeResponse[]>('/resumes');
  }

  get(id: number): Observable<ApiResponse<ResumeResponse>> {
    return this.api.get<ResumeResponse>(`/resumes/${id}`);
  }

  setPrimary(id: number): Observable<ApiResponse<ResumeResponse>> {
    return this.api.patch<ResumeResponse>(`/resumes/${id}/primary`);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`/resumes/${id}`);
  }
}

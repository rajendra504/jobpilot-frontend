import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse, Page } from './api-service';

export interface ApplicationAnswer {
  question: string;
  answer: string;
}

export interface AiAnalysisResponse {
  id: number;
  jobListingId: number;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  decision: string;
  decisionReason: string;
  missingSkills: string[];
  coverLetter: string;
  resumeSnippet: string;
  applicationAnswers: ApplicationAnswer[];
  status: string;
  errorMessage: string;
  promptTokensUsed: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private api: ApiService) { }

  analyseJob(jobId: number): Observable<ApiResponse<AiAnalysisResponse>> {
    return this.api.post<AiAnalysisResponse>(`/ai/analyse/${jobId}`);
  }

  batchAnalyse(): Observable<ApiResponse<AiAnalysisResponse[]>> {
    return this.api.post<AiAnalysisResponse[]>('/ai/analyse/batch');
  }

  getAnalysis(jobId: number): Observable<ApiResponse<AiAnalysisResponse>> {
    return this.api.get<AiAnalysisResponse>(`/ai/analyses/${jobId}`);
  }

  getAllAnalyses(params: {
    decision?: string;
    page?: number;
    size?: number;
  } = {}): Observable<ApiResponse<Page<AiAnalysisResponse>>> {
    const p: Record<string, string | number> = {};
    if (params.decision) p['decision'] = params.decision;
    p['page'] = params.page ?? 0;
    p['size'] = params.size ?? 15;
    return this.api.get<Page<AiAnalysisResponse>>('/ai/analyses', p);
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobService, JobListingResponse } from '../../core/services/job-service';
import { AiService, AiAnalysisResponse } from '../../core/services/ai-service';

@Component({
  selector: 'app-job-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
})
export class JobDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private aiService = inject(AiService);

  job = signal<JobListingResponse | null>(null);
  analysis = signal<AiAnalysisResponse | null>(null);
  loading = signal(true);
  analysing = signal(false);
  error = signal('');
  analysisError = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadJob(id);
  }

  loadJob(id: number): void {
    // Load from list (get all and filter - since no single GET /jobs/:id endpoint)
    this.jobService.getListings({ size: 1000 }).subscribe({
      next: res => {
        const found = res.data?.content?.find(j => j.id === id) ?? null;
        this.job.set(found);
        this.loading.set(false);
        if (found) this.loadAnalysis(id);
      },
      error: () => {
        this.error.set('Failed to load job.');
        this.loading.set(false);
      }
    });
  }

  loadAnalysis(jobId: number): void {
    this.aiService.getAnalysis(jobId).subscribe({
      next: res => this.analysis.set(res.data),
      error: () => { } // No analysis yet — that's fine
    });
  }

  runAnalysis(): void {
    if (!this.job()) return;
    this.analysing.set(true);
    this.analysisError.set('');
    this.aiService.analyseJob(this.job()!.id).subscribe({
      next: res => {
        this.analysis.set(res.data);
        this.analysing.set(false);
      },
      error: err => {
        this.analysisError.set(err.error?.message || 'Analysis failed.');
        this.analysing.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      NEW: 'badge-new', ANALYSED: 'badge-pending', APPLIED: 'badge-applied',
      SKIPPED: 'badge-skipped', FAILED: 'badge-failed', MANUAL: 'badge-manual'
    };
    return map[status] || 'badge-new';
  }
}

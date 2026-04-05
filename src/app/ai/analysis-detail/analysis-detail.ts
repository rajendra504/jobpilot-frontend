import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AiService, AiAnalysisResponse } from '../../core/services/ai-service';

@Component({
  selector: 'app-analysis-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './analysis-detail.html',
  styleUrl: './analysis-detail.scss',
})
export class AnalysisDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private aiService = inject(AiService);

  analysis = signal<AiAnalysisResponse | null>(null);
  loading = signal(true);
  error = signal('');
  reanalysing = signal(false);

  ngOnInit(): void {
    const jobId = Number(this.route.snapshot.paramMap.get('id'));
    this.load(jobId);
  }

  load(jobId: number): void {
    this.aiService.getAnalysis(jobId).subscribe({
      next: res => { this.analysis.set(res.data); this.loading.set(false); },
      error: err => { this.error.set(err.error?.message || 'Analysis not found.'); this.loading.set(false); }
    });
  }

  reanalyse(): void {
    const jobId = this.analysis()?.jobListingId;
    if (!jobId) return;
    this.reanalysing.set(true);
    this.aiService.analyseJob(jobId).subscribe({
      next: res => { this.analysis.set(res.data); this.reanalysing.set(false); },
      error: err => { this.error.set(err.error?.message || 'Re-analysis failed.'); this.reanalysing.set(false); }
    });
  }

  scoreClass(score: number): string {
    if (score >= 70) return 'good';
    if (score >= 50) return 'mid';
    return 'bad';
  }

  goBack(): void { this.router.navigate(['/ai']); }
}

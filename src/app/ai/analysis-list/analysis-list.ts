import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AiService, AiAnalysisResponse } from '../../core/services/ai-service';

@Component({
  selector: 'app-analysis-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './analysis-list.html',
  styleUrl: './analysis-list.scss',
})
export class AnalysisList implements OnInit {
  private aiService = inject(AiService);

  analyses = signal<AiAnalysisResponse[]>([]);
  loading = signal(true);
  batchLoading = signal(false);
  error = signal('');
  batchMsg = signal('');
  batchError = signal('');

  decisionFilter = signal('');
  readonly decisionOptions = ['', 'APPLY', 'SKIP'];

  // Server-side pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  readonly pageSize = 15;

  ngOnInit(): void { this.loadAnalyses(); }

  loadAnalyses(): void {
    this.loading.set(true);
    this.error.set('');
    this.aiService.getAllAnalyses({
      decision: this.decisionFilter() || undefined,
      page: this.currentPage(),
      size: this.pageSize,
    }).subscribe({
      next: res => {
        this.analyses.set(res.data?.content ?? []);
        this.totalPages.set(res.data?.totalPages ?? 0);
        this.totalElements.set(res.data?.totalElements ?? 0);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to load analyses.');
        this.loading.set(false);
      }
    });
  }

  applyFilter(): void {
    this.currentPage.set(0);
    this.loadAnalyses();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadAnalyses();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageRange(): number[] {
    const total = this.totalPages();
    const cur = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: number[] = [0];
    if (cur > 2) pages.push(-1);
    const start = Math.max(1, cur - 1);
    const end = Math.min(total - 2, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (cur < total - 3) pages.push(-1);
    pages.push(total - 1);
    return pages;
  }

  runBatch(): void {
    this.batchLoading.set(true);
    this.batchMsg.set('');
    this.batchError.set('');
    this.aiService.batchAnalyse().subscribe({
      next: res => {
        this.batchMsg.set(res.message);
        this.batchLoading.set(false);
        this.currentPage.set(0);
        this.loadAnalyses();
      },
      error: err => {
        this.batchError.set(err.error?.message || 'Batch analysis failed.');
        this.batchLoading.set(false);
      }
    });
  }

  scoreClass(score: number): string {
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-mid';
    return 'score-bad';
  }
}

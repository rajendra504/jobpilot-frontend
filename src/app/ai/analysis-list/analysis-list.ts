import { Component, computed, inject, OnInit, signal } from '@angular/core';
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

  allAnalyses = signal<AiAnalysisResponse[]>([]);
  analyses = signal<AiAnalysisResponse[]>([]); // filtered
  loading = signal(true);
  batchLoading = signal(false);
  error = signal('');
  batchMsg = signal('');
  batchError = signal('');

  decisionFilter = signal('');
  readonly decisionOptions = ['', 'APPLY', 'SKIP'];

  // ── Pagination ──────────────────────────────────────────────
  currentPage = signal(0);
  readonly pageSize = 15;

  totalPages = computed(() => Math.ceil(this.analyses().length / this.pageSize));

  pagedAnalyses = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.analyses().slice(start, start + this.pageSize);
  });

  pageRange = computed(() => {
    const total = this.totalPages();
    const cur = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    const pages: number[] = [0];
    if (cur > 2) pages.push(-1); // ellipsis

    const start = Math.max(1, cur - 1);
    const end = Math.min(total - 2, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (cur < total - 3) pages.push(-1); // ellipsis
    pages.push(total - 1);
    return pages;
  });

  ngOnInit(): void { this.loadAnalyses(); }

  loadAnalyses(): void {
    this.loading.set(true);
    this.error.set('');
    this.aiService.getAllAnalyses(this.decisionFilter() || undefined).subscribe({
      next: res => {
        this.allAnalyses.set(res.data ?? []);
        this.analyses.set(res.data ?? []);
        this.currentPage.set(0);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to load analyses.');
        this.loading.set(false);
      }
    });
  }

  applyFilter(): void {
    const filter = this.decisionFilter();
    const all = this.allAnalyses();
    this.analyses.set(filter ? all.filter(a => a.decision === filter) : all);
    this.currentPage.set(0);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  runBatch(): void {
    this.batchLoading.set(true);
    this.batchMsg.set('');
    this.batchError.set('');
    this.aiService.batchAnalyse().subscribe({
      next: res => {
        this.batchMsg.set(res.message);
        this.batchLoading.set(false);
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

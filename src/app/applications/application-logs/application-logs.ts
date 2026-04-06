import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RunnerService, ApplicationLogResponse, RunResult } from '../../core/services/runner-service';

@Component({
  selector: 'app-application-logs',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './application-logs.html',
  styleUrl: './application-logs.scss',
})
export class ApplicationLogs implements OnInit {
  private runner = inject(RunnerService);

  logs = signal<ApplicationLogResponse[]>([]);
  stats = signal<Record<string, number>>({});
  loading = signal(true);
  running = signal(false);
  error = signal('');
  runResult = signal<RunResult | null>(null);
  runError = signal('');

  statusFilter = signal('');
  readonly statusOptions = ['', 'APPLIED', 'FAILED', 'MANUAL', 'SKIPPED', 'APPLYING'];

  readonly statCards = [
    { key: 'APPLIED', label: 'Applied', icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
    { key: 'FAILED', label: 'Failed', icon: '❌', color: '#dc2626', bg: '#fef2f2' },
    { key: 'MANUAL', label: 'Manual', icon: '🖐', color: '#d97706', bg: '#fffbeb' },
    { key: 'SKIPPED', label: 'Skipped', icon: '⏭', color: '#6b7280', bg: '#f4f4f8' },
  ] as const;

  // Server-side pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  readonly pageSize = 20;

  ngOnInit(): void {
    this.loadLogs();
    this.loadStats();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.error.set('');
    this.runner.getLogs({
      status: this.statusFilter() || undefined,
      page: this.currentPage(),
      size: this.pageSize,
    }).subscribe({
      next: res => {
        this.logs.set(res.data?.content ?? []);
        this.totalPages.set(res.data?.totalPages ?? 0);
        this.totalElements.set(res.data?.totalElements ?? 0);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to load logs.');
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.runner.getStats().subscribe({
      next: res => this.stats.set(res.data ?? {}),
      error: () => { }
    });
  }

  applyFilter(): void {
    this.currentPage.set(0);
    this.loadLogs();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadLogs();
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

  triggerRun(): void {
    this.running.set(true);
    this.runResult.set(null);
    this.runError.set('');
    this.runner.run().subscribe({
      next: res => {
        this.runResult.set(res.data);
        this.running.set(false);
        this.currentPage.set(0);
        this.loadLogs();
        this.loadStats();
      },
      error: err => {
        this.runError.set(err.error?.message || 'Run failed.');
        this.running.set(false);
      }
    });
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      APPLIED: 'badge-applied',
      FAILED: 'badge-failed',
      MANUAL: 'badge-manual',
      SKIPPED: 'badge-skipped',
      APPLYING: 'badge-applying',
    };
    return map[status] || 'badge-new';
  }

  decisionBadge(d: string): string {
    return d === 'APPLY' ? 'badge-apply' : 'badge-skip';
  }
}

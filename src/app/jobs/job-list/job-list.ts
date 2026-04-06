import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService, JobListingResponse, ScrapeStatus } from '../../core/services/job-service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-job-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
})
export class JobList implements OnInit, OnDestroy {
  private jobService = inject(JobService);

  jobs = signal<JobListingResponse[]>([]);
  loading = signal(true);
  scraping = signal(false);
  scrapeError = signal('');
  error = signal('');

  scrapePhase = signal('');
  pollCount = signal(0);
  pollElapsed = signal(0);

  private statusPollSub?: Subscription;
  private jobsPollSub?: Subscription;
  private timerSub?: Subscription;

  statusFilter = signal('');
  portalFilter = signal('');

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = 20;

  readonly statusOptions = ['', 'NEW', 'ANALYSED', 'APPLIED', 'SKIPPED', 'FAILED', 'MANUAL'];
  readonly portalOptions = ['', 'linkedin', 'naukri'];

  ngOnInit(): void { this.loadJobs(); }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadJobs(): void {
    this.loading.set(true);
    this.error.set('');
    this.jobService.getListings({
      status: this.statusFilter() || undefined,
      portal: this.portalFilter() || undefined,
      page: this.currentPage(),
      size: this.pageSize,
    }).subscribe({
      next: res => {
        this.jobs.set(res.data?.content ?? []);
        this.totalPages.set(res.data?.totalPages ?? 0);
        this.totalElements.set(res.data?.totalElements ?? 0);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to load jobs.');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(0);
    this.loadJobs();
  }

  triggerScrape(): void {
    if (this.scraping()) return;

    this.scraping.set(true);
    this.scrapeError.set('');
    this.scrapePhase.set('STARTING');
    this.pollCount.set(0);
    this.pollElapsed.set(0);

    this.jobService.scrape().subscribe({
      next: () => {  },
      error: err => {
        this.scraping.set(false);
        this.stopPolling();
        this.scrapeError.set(err.error?.message || 'Failed to start scrape. Check server logs.');
        this.loadJobs();
      }
    });

    this.statusPollSub = interval(4000).pipe(
      switchMap(() => this.jobService.getScrapeStatus())
    ).subscribe({
      next: res => {
        const status: ScrapeStatus = res.data;
        this.scrapePhase.set(status?.phase ?? '');
        this.pollCount.set(status?.jobsSavedSoFar ?? 0);

        if (status && !status.running) {

          this.scraping.set(false);
          this.stopPolling();
          this.loadJobs();

          if (status.error) {
            this.scrapeError.set(status.error);
          }
        }
      },
      error: () => {

      }
    });

    this.jobsPollSub = interval(5000).pipe(
      switchMap(() => this.jobService.getListings({
        status: this.statusFilter() || undefined,
        portal: this.portalFilter() || undefined,
        page: 0,
        size: this.pageSize,
      }))
    ).subscribe({
      next: res => {
        if (this.currentPage() === 0) {
          this.jobs.set(res.data?.content ?? []);
          this.totalPages.set(res.data?.totalPages ?? 0);
        }
        this.totalElements.set(res.data?.totalElements ?? 0);
      }
    });

    this.timerSub = interval(1000).subscribe(() => {
      this.pollElapsed.update(n => n + 1);
    });
  }

  stopScrape(): void {
    this.scraping.set(false);
    this.stopPolling();
    this.loadJobs();
  }

  private stopPolling(): void {
    this.statusPollSub?.unsubscribe();
    this.jobsPollSub?.unsubscribe();
    this.timerSub?.unsubscribe();
    this.statusPollSub = undefined;
    this.jobsPollSub = undefined;
    this.timerSub = undefined;
  }

  updateStatus(id: number, status: string): void {
    this.jobService.updateStatus(id, status).subscribe({
      next: res => {
        this.jobs.update(jobs => jobs.map(j => j.id === id ? { ...j, status: res.data.status } : j));
      },
      error: () => { }
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadJobs();
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

  formatElapsed(secs: number): string {
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  }

  phaseLabel(phase: string): string {
    switch (phase) {
      case 'STARTING': return 'Starting up...';
      case 'SCRAPING_LINKEDIN': return 'Scraping LinkedIn...';
      case 'SCRAPING_NAUKRI': return 'Scraping Naukri...';
      case 'IDLE': return 'Done';
      default: return phase || 'Running...';
    }
  }

  portalBadge(portal: string): string {
    return portal?.toLowerCase() === 'linkedin' ? 'badge-linkedin' : 'badge-naukri';
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      NEW: 'badge-new',
      ANALYSED: 'badge-analysed',
      APPLYING: 'badge-applying',
      APPLIED: 'badge-applied',
      SKIPPED: 'badge-skipped',
      FAILED: 'badge-failed',
      MANUAL: 'badge-manual',
    };
    return map[status] || 'badge-new';
  }
}

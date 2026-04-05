import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService, JobListingResponse } from '../../core/services/job-service';

@Component({
  selector: 'app-job-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
})
export class JobList implements OnInit {
  private jobService = inject(JobService);

  jobs = signal<JobListingResponse[]>([]);
  loading = signal(true);
  scraping = signal(false);
  scrapeMsg = signal('');
  scrapeError = signal('');
  error = signal('');

  statusFilter = signal('');
  portalFilter = signal('');

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = 20;

  readonly statusOptions = ['', 'NEW', 'ANALYSED', 'APPLIED', 'SKIPPED', 'FAILED', 'MANUAL'];
  readonly portalOptions = ['', 'LINKEDIN', 'NAUKRI'];

  ngOnInit(): void { this.loadJobs(); }

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
    this.scraping.set(true);
    this.scrapeMsg.set('');
    this.scrapeError.set('');
    this.jobService.scrape().subscribe({
      next: res => {
        this.scrapeMsg.set(res.message);
        this.scraping.set(false);
        this.loadJobs();
      },
      error: err => {
        this.scrapeError.set(err.error?.message || 'Scrape failed.');
        this.scraping.set(false);
      }
    });
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

  // Returns page numbers with -1 as ellipsis placeholder
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

import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RunnerService } from '../../core/services/runner-service';
import { AiService } from '../../core/services/ai-service';
import { AuthService } from '../../core/services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  private runner = inject(RunnerService);
  private ai = inject(AiService);
  private auth = inject(AuthService);

  private destroyRef = inject(DestroyRef);

  stats = signal<Record<string, number>>({});
  recentAnalyses = signal<any[]>([]);
  loading = signal(true);
  runnerLoading = signal(false);
  runResult = signal<any>(null);
  runError = signal('');

  user = this.auth.user;

  readonly statCards = [
    { key: 'APPLIED', label: 'Applied', icon: '✅', color: '#16a34a', bg: '#f0fdf4', link: '/applications' },
    { key: 'FAILED', label: 'Failed', icon: '❌', color: '#dc2626', bg: '#fef2f2', link: '/applications' },
    { key: 'MANUAL', label: 'Manual', icon: '🖐', color: '#d97706', bg: '#fffbeb', link: '/applications' },
    { key: 'SKIPPED', label: 'Skipped', icon: '⏭', color: '#6b7280', bg: '#f4f4f8', link: '/applications' },
  ] as const;

  greeting = signal(this.getGreetingTime());

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentAnalyses();
  }

  loadStats(): void {
    this.runner.getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          //console.log('STATS API:', res);

          this.stats.set(res.data ?? {});
          this.loading.set(false);
        },
        error: err => {
          //console.error('STATS ERROR:', err);
          this.loading.set(false);
        }
      });
  }

  loadRecentAnalyses(): void {
    this.ai.getAllAnalyses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          console.log('ANALYSIS API:', res);
          this.recentAnalyses.set((res.data?.content ?? []).slice(0, 6));
        },
        error: err => {
          console.error('ANALYSIS ERROR:', err);
        }
      });
  }

  triggerRun(): void {
    if (this.runnerLoading()) return;

    this.runnerLoading.set(true);
    this.runResult.set(null);
    this.runError.set('');

    this.runner.run()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          //console.log('RUN RESULT:', res);

          this.runResult.set(res.data);
          this.runnerLoading.set(false);

          this.loadStats();
        },
        error: err => {
         // console.error('RUN ERROR:', err);

          this.runError.set(err.error?.message || 'Run failed.');
          this.runnerLoading.set(false);
        }
      });
  }

  private getGreetingTime(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionService, SessionStatus } from '../../core/services/session-service';

@Component({
  selector: 'app-session-manager',
  imports: [CommonModule, RouterModule],
  templateUrl: './session-manager.html',
  styleUrl: './session-manager.scss',
})
export class SessionManager implements OnInit {
  private sessionService = inject(SessionService);

  status = signal<SessionStatus | null>(null);
  loading = signal(true);
  error = signal('');
  success = signal('');

  // Track in-progress state per portal
  initiating = signal<string | null>(null);
  confirming = signal<string | null>(null);
  clearing = signal<string | null>(null);

  // Instructions shown after init, keyed by portal
  pendingInstructions = signal<Record<string, string>>({});

  readonly portals = [
    {
      key: 'linkedin',
      label: 'LinkedIn',
      logoClass: 'portal-logo--linkedin',
      logoText: 'in',
      description: 'Required for LinkedIn job scraping and Easy Apply automation.',
    },
    {
      key: 'naukri',
      label: 'Naukri',
      logoClass: 'portal-logo--naukri',
      logoText: 'N',
      description: 'Required for Naukri.com job scraping and auto-apply.',
    },
  ];

  ngOnInit(): void { this.loadStatus(); }

  loadStatus(): void {
    this.loading.set(true);
    this.sessionService.getStatus().subscribe({
      next: res => { this.status.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  isActive(portal: string): boolean {
    const s = this.status();
    if (!s) return false;
    return portal === 'linkedin' ? s.linkedin : s.naukri;
  }

  hasPendingInstruction(portal: string): boolean {
    return !!this.pendingInstructions()[portal];
  }

  getInstruction(portal: string): string {
    return this.pendingInstructions()[portal] ?? '';
  }

  initSession(portal: string): void {
    this.initiating.set(portal);
    this.error.set('');
    this.success.set('');

    this.sessionService.initSession(portal).subscribe({
      next: res => {
        this.initiating.set(null);
        // Store the instruction so user knows what to do next
        this.pendingInstructions.update(prev => ({
          ...prev,
          [portal]: res.data?.instruction ?? 'Log in manually in the browser window, then click Confirm.'
        }));
      },
      error: err => {
        this.initiating.set(null);
        this.error.set(err.error?.message || `Failed to start ${portal} session.`);
      }
    });
  }

  confirmSession(portal: string): void {
    this.confirming.set(portal);
    this.error.set('');
    this.success.set('');

    this.sessionService.confirmSession(portal).subscribe({
      next: res => {
        this.confirming.set(null);
        // Remove the instruction since session is now saved
        this.pendingInstructions.update(prev => {
          const copy = { ...prev };
          delete copy[portal];
          return copy;
        });
        this.success.set(
          `${portal.charAt(0).toUpperCase() + portal.slice(1)} session saved successfully! ` +
          `Valid for ${res.data?.validForDays ?? 25} days.`
        );
        this.loadStatus(); // Refresh session status badges
        setTimeout(() => this.success.set(''), 5000);
      },
      error: err => {
        this.confirming.set(null);
        this.error.set(err.error?.message || `Failed to confirm ${portal} session. Did you log in first?`);
      }
    });
  }

  clearSession(portal: string): void {
    if (!confirm(`Clear the saved ${portal} session? You will need to log in again before the next scrape.`)) return;

    this.clearing.set(portal);
    this.error.set('');

    this.sessionService.clearSession(portal).subscribe({
      next: () => {
        this.clearing.set(null);
        this.success.set(`${portal} session cleared.`);
        this.loadStatus();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: err => {
        this.clearing.set(null);
        this.error.set(err.error?.message || `Failed to clear ${portal} session.`);
      }
    });
  }
}

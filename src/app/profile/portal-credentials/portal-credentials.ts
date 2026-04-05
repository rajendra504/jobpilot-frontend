import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService, UserProfileResponse } from '../../core/services/profile-service';

@Component({
  selector: 'app-portal-credentials',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './portal-credentials.html',
  styleUrl: './portal-credentials.scss',
})
export class PortalCredentials implements OnInit {
  private profileService = inject(ProfileService);

  profile = signal<UserProfileResponse | null>(null);
  loading = signal(true);
  saving = signal<string | null>(null);
  removing = signal<string | null>(null);
  success = signal('');
  error = signal('');

  linkedinUser = signal('');
  linkedinPass = signal('');
  naukriUser = signal('');
  naukriPass = signal('');
  showLinkedinPass = signal(false);
  showNaukriPass = signal(false);

  readonly portals = ['LINKEDIN', 'NAUKRI'];

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: res => { this.profile.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  isConnected(portal: string): boolean {
    return this.profile()?.connectedPortals?.includes(portal) ?? false;
  }

  saveCredential(portal: string): void {
    const username = portal === 'LINKEDIN' ? this.linkedinUser() : this.naukriUser();
    const password = portal === 'LINKEDIN' ? this.linkedinPass() : this.naukriPass();
    if (!username || !password) { this.error.set('Username and password are required.'); return; }

    this.saving.set(portal);
    this.error.set('');
    this.success.set('');

    this.profileService.saveCredential({ portal, username, password }).subscribe({
      next: res => {
        this.profile.set(res.data);
        this.success.set(`${portal} credentials saved securely.`);
        this.saving.set(null);
        if (portal === 'LINKEDIN') { this.linkedinPass.set(''); }
        else { this.naukriPass.set(''); }
        setTimeout(() => this.success.set(''), 3000);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to save credentials.');
        this.saving.set(null);
      }
    });
  }

  removeCredential(portal: string): void {
    if (!confirm(`Remove ${portal} credentials?`)) return;
    this.removing.set(portal);
    this.profileService.removeCredential(portal).subscribe({
      next: res => {
        this.profile.set(res.data);
        this.removing.set(null);
        this.success.set(`${portal} credentials removed.`);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to remove credentials.');
        this.removing.set(null);
      }
    });
  }
}

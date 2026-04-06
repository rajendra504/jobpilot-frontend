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

  // Which portal's edit form is expanded
  editingLinkedin = signal(false);
  editingNaukri = signal(false);

  readonly portals = ['LINKEDIN', 'NAUKRI'];

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: res => {
        this.profile.set(res.data);
        this.loading.set(false);
        // Pre-fill usernames from profile if available (passwords are never returned)
        // connectedPortals uses lowercase keys like "linkedin", "naukri"
        // We just show the connected state — usernames are not returned by the API for security
      },
      error: () => this.loading.set(false)
    });
  }

  /**
   * Backend stores portal keys in lowercase ("linkedin", "naukri").
   * The UI passes uppercase ("LINKEDIN", "NAUKRI").
   * Normalise before comparing.
   */
  isConnected(portal: string): boolean {
    const connected = this.profile()?.connectedPortals ?? [];
    return connected.some(p => p.toLowerCase() === portal.toLowerCase());
  }

  toggleEdit(portal: string): void {
    if (portal === 'LINKEDIN') {
      this.editingLinkedin.update(v => !v);
      this.linkedinPass.set('');
    } else {
      this.editingNaukri.update(v => !v);
      this.naukriPass.set('');
    }
    this.error.set('');
  }

  saveCredential(portal: string): void {
    const username = portal === 'LINKEDIN' ? this.linkedinUser() : this.naukriUser();
    const password = portal === 'LINKEDIN' ? this.linkedinPass() : this.naukriPass();
    if (!username || !password) { this.error.set('Both email and password are required.'); return; }

    this.saving.set(portal);
    this.error.set('');
    this.success.set('');

    this.profileService.saveCredential({ portal, username, password }).subscribe({
      next: res => {
        this.profile.set(res.data);
        this.success.set(`${portal} credentials saved.`);
        this.saving.set(null);
        // Collapse edit form after save
        if (portal === 'LINKEDIN') { this.linkedinPass.set(''); this.editingLinkedin.set(false); }
        else { this.naukriPass.set(''); this.editingNaukri.set(false); }
        setTimeout(() => this.success.set(''), 3000);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to save credentials.');
        this.saving.set(null);
      }
    });
  }

  removeCredential(portal: string): void {
    if (!confirm(`Remove ${portal} credentials? You will need to re-enter them to use this portal.`)) return;
    this.removing.set(portal);
    this.profileService.removeCredential(portal).subscribe({
      next: res => {
        this.profile.set(res.data);
        this.removing.set(null);
        this.success.set(`${portal} credentials removed.`);
        if (portal === 'LINKEDIN') { this.linkedinUser.set(''); this.editingLinkedin.set(false); }
        else { this.naukriUser.set(''); this.editingNaukri.set(false); }
        setTimeout(() => this.success.set(''), 3000);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to remove credentials.');
        this.removing.set(null);
      }
    });
  }
}

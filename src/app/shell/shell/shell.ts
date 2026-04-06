import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {

  private auth = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(true);
  currentRoute = signal('');

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: '⊞', route: '/dashboard' },
    { label: 'Jobs', icon: '💼', route: '/jobs' },
    { label: 'AI Analysis', icon: '🤖', route: '/ai' },
    { label: 'Applications', icon: '📋', route: '/applications' },
    { label: 'Profile', icon: '👤', route: '/profile' },
    { label: 'Sessions', icon: '🍪', route: '/profile/sessions' },
    { label: 'Preferences', icon: '⚙️', route: '/preferences' },
  ];

  user = this.auth.user;

  userInitials = computed(() => {
    const name = this.user()?.fullName ?? '';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'JP';
  });

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((e) => {
      this.currentRoute.set(e.urlAfterRedirects);
    });
  }

  isActive(route: string): boolean {
    return this.currentRoute().startsWith(route);
  }

  logout(): void {
    this.auth.logout();
  }
}

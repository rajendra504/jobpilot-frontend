import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreferencesService, JobPreferencesRequest, JobPreferencesResponse } from '../../core/services/preferences-service';

@Component({
  selector: 'app-preferences-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './preferences-form.html',
  styleUrl: './preferences-form.scss',
})
export class PreferencesForm implements OnInit {
  private prefService = inject(PreferencesService);

  loading = signal(true);
  saving = signal(false);
  success = signal('');
  error = signal('');

  // Form state
  desiredRolesInput = signal('');
  preferredLocationsInput = signal('');
  preferredIndustriesInput = signal('');
  minSalary = signal<number | null>(null);
  maxSalary = signal<number | null>(null);
  currency = signal('INR');
  experienceLevel = signal('');
  noticePeriodDays = signal(0);
  dailyApplyLimit = signal<number | null>(null);
  autoApplyEnabled = signal(false);
  openToRemote = signal(true);
  openToHybrid = signal(true);
  openToRelocation = signal(false);
  jobTypes = signal<string[]>([]);

  readonly jobTypeOptions = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];
  readonly expLevelOptions = ['FRESHER', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER'];
  readonly currencyOptions = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

  ngOnInit(): void {
    this.prefService.get().subscribe({
      next: res => {
        const p = res.data;
        this.desiredRolesInput.set((p.desiredRoles || []).join(', '));
        this.preferredLocationsInput.set((p.preferredLocations || []).join(', '));
        this.preferredIndustriesInput.set((p.preferredIndustries || []).join(', '));
        this.minSalary.set(p.minSalary || null);
        this.maxSalary.set(p.maxSalary || null);
        this.currency.set(p.currency || 'INR');
        this.experienceLevel.set(p.experienceLevel || '');
        this.noticePeriodDays.set(p.noticePeriodDays ?? 0);
        this.dailyApplyLimit.set(p.dailyApplyLimit || null);
        this.autoApplyEnabled.set(p.autoApplyEnabled ?? false);
        this.openToRemote.set(p.openToRemote ?? true);
        this.openToHybrid.set(p.openToHybrid ?? true);
        this.openToRelocation.set(p.openToRelocation ?? false);
        this.jobTypes.set(p.jobTypes || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleJobType(type: string): void {
    this.jobTypes.update(types =>
      types.includes(type) ? types.filter(t => t !== type) : [...types, type]
    );
  }

  save(): void {
    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const req: JobPreferencesRequest = {
      desiredRoles: this.desiredRolesInput().split(',').map(s => s.trim()).filter(Boolean),
      preferredLocations: this.preferredLocationsInput().split(',').map(s => s.trim()).filter(Boolean),
      preferredIndustries: this.preferredIndustriesInput().split(',').map(s => s.trim()).filter(Boolean),
      jobTypes: this.jobTypes(),
      minSalary: this.minSalary() ?? undefined,
      maxSalary: this.maxSalary() ?? undefined,
      currency: this.currency(),
      experienceLevel: this.experienceLevel() || undefined,
      noticePeriodDays: this.noticePeriodDays(),
      dailyApplyLimit: this.dailyApplyLimit() ?? undefined,
      autoApplyEnabled: this.autoApplyEnabled(),
      openToRemote: this.openToRemote(),
      openToHybrid: this.openToHybrid(),
      openToRelocation: this.openToRelocation(),
    };

    this.prefService.saveOrUpdate(req).subscribe({
      next: () => {
        this.success.set('Preferences saved successfully!');
        this.saving.set(false);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to save preferences.');
        this.saving.set(false);
      }
    });
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ProfileService, UserProfileRequest, UserProfileResponse,
  EducationDto, ExperienceDto, QaPairDto
} from '../../core/services/profile-service';

@Component({
  selector: 'app-profile-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.scss',
})
export class ProfileForm implements OnInit {
  private profileService = inject(ProfileService);

  profile = signal<UserProfileResponse | null>(null);
  loading = signal(true);
  saving = signal(false);
  success = signal('');
  error = signal('');
  isNew = signal(false);

  activeTab = signal<'basic' | 'education' | 'experience' | 'qa'>('basic');

  // Form fields
  phone = signal('');
  location = signal('');
  linkedinUrl = signal('');
  githubUrl = signal('');
  portfolioUrl = signal('');
  summary = signal('');
  skillsInput = signal('');
  languagesInput = signal('');

  education = signal<EducationDto[]>([]);
  experience = signal<ExperienceDto[]>([]);
  qaBank = signal<QaPairDto[]>([]);

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: res => {
        const p = res.data;
        this.profile.set(p);
        this.phone.set(p.phone || '');
        this.location.set(p.location || '');
        this.linkedinUrl.set(p.linkedinUrl || '');
        this.githubUrl.set(p.githubUrl || '');
        this.portfolioUrl.set(p.portfolioUrl || '');
        this.summary.set(p.summary || '');
        this.skillsInput.set((p.skills || []).join(', '));
        this.languagesInput.set((p.languages || []).join(', '));
        this.education.set(p.education ? [...p.education] : []);
        this.experience.set(p.experience ? [...p.experience] : []);
        this.qaBank.set(p.qaBank ? [...p.qaBank] : []);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) { this.isNew.set(true); }
        this.loading.set(false);
      }
    });
  }

  save(): void {
    this.saving.set(true);
    this.success.set('');
    this.error.set('');

    const req: UserProfileRequest = {
      phone: this.phone(),
      location: this.location(),
      linkedinUrl: this.linkedinUrl(),
      githubUrl: this.githubUrl(),
      portfolioUrl: this.portfolioUrl(),
      summary: this.summary(),
      skills: this.skillsInput().split(',').map(s => s.trim()).filter(Boolean),
      languages: this.languagesInput().split(',').map(s => s.trim()).filter(Boolean),
      education: this.education(),
      experience: this.experience(),
      qaBank: this.qaBank(),
    };

    const call$ = this.isNew()
      ? this.profileService.createProfile(req)
      : this.profileService.updateProfile(req);

    call$.subscribe({
      next: res => {
        this.profile.set(res.data);
        this.isNew.set(false);
        this.success.set('Profile saved successfully!');
        this.saving.set(false);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to save profile.');
        this.saving.set(false);
      }
    });
  }

  // Education helpers
  addEducation(): void {
    this.education.update(e => [...e, { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', gpa: 0 }]);
  }
  removeEducation(i: number): void {
    this.education.update(e => e.filter((_, idx) => idx !== i));
  }
  updateEducation(i: number, field: keyof EducationDto, val: string | number): void {
    this.education.update(e => e.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  // Experience helpers
  addExperience(): void {
    this.experience.update(e => [...e, { company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' }]);
  }
  removeExperience(i: number): void {
    this.experience.update(e => e.filter((_, idx) => idx !== i));
  }
  updateExperience(i: number, field: keyof ExperienceDto, val: string | boolean): void {
    this.experience.update(e => e.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  // QA helpers
  addQa(): void {
    this.qaBank.update(q => [...q, { question: '', answer: '' }]);
  }
  removeQa(i: number): void {
    this.qaBank.update(q => q.filter((_, idx) => idx !== i));
  }
  updateQa(i: number, field: 'question' | 'answer', val: string): void {
    this.qaBank.update(q => q.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }
}

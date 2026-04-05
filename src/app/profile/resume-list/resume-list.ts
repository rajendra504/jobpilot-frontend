import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResumeService, ResumeResponse } from '../../core/services/resume-service';

@Component({
  selector: 'app-resume-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './resume-list.html',
  styleUrl: './resume-list.scss',
})
export class ResumeList implements OnInit {
  private resumeService = inject(ResumeService);

  resumes = signal<ResumeResponse[]>([]);
  loading = signal(true);
  uploading = signal(false);
  error = signal('');
  success = signal('');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.resumeService.list().subscribe({
      next: res => { this.resumes.set(res.data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.error.set('');
    this.success.set('');

    this.resumeService.upload(file).subscribe({
      next: res => {
        this.success.set(`"${res.data.originalFilename}" uploaded successfully.`);
        this.uploading.set(false);
        this.load();
        input.value = '';
        setTimeout(() => this.success.set(''), 4000);
      },
      error: err => {
        this.error.set(err.error?.message || 'Upload failed.');
        this.uploading.set(false);
      }
    });
  }

  setPrimary(id: number): void {
    this.resumeService.setPrimary(id).subscribe({
      next: () => { this.load(); },
      error: () => { }
    });
  }

  deleteResume(id: number): void {
    if (!confirm('Delete this resume?')) return;
    this.resumeService.delete(id).subscribe({
      next: () => this.load(),
      error: () => { }
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-schedule',
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './admin-schedule.component.html'
})
export class AdminScheduleComponent implements OnInit {
  adminService = inject(AdminService);
  router = inject(Router);

  submitting = signal(false);
  errorMsg = '';
  successMsg = '';

  form = new FormGroup({
    candidateId: new FormControl('', { nonNullable: true }),
    positionId: new FormControl('', { nonNullable: true }),
    interviewerIds: new FormControl<string[]>([]),
    date: new FormControl('', { nonNullable: true }),
    time: new FormControl('', { nonNullable: true }),
    duration: new FormControl('45', { nonNullable: true }),
    type: new FormControl('Technical Assessment', { nonNullable: true })
  });

  ngOnInit() {
    this.adminService.loadScheduleData();
  }

  isFormValid() {
    if (!this.form.value.date || !this.form.value.time || !this.form.value.positionId) return false;
    if (!this.form.value.interviewerIds || this.form.value.interviewerIds.length === 0) return false;
    return !!this.form.value.candidateId;
  }

  previewCandidate() {
    const c = this.adminService.candidates().find(x => x.id === this.form.value.candidateId);
    return c ? `${c.firstname} ${c.lastname}` : '-';
  }

  previewPosition() {
    const p = this.adminService.positions().find(x => x.id === this.form.value.positionId);
    return p ? p.title : '-';
  }

  previewInterviewers() {
    const ids = this.form.value.interviewerIds || [];
    const names = ids.map(id => {
      const i = this.adminService.interviewers().find(x => x.id === id);
      return i ? `${i.firstname} ${i.lastname}` : null;
    }).filter(Boolean);
    return names.length ? names.join(', ') : '-';
  }

  schedule() {
    if (!this.isFormValid() || this.submitting()) return;
    this.submitting.set(true);
    this.errorMsg = '';
    this.successMsg = '';

    const date = this.form.value.date!;
    const time = this.form.value.time!;
    const durationMin = Number(this.form.value.duration);

    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + durationMin * 60000);

    this.createInterview(this.form.value.candidateId!, startTime, endTime, date);
  }

  private createInterview(candidateId: string, startTime: Date, endTime: Date, date: string) {
    this.adminService.createInterview({
      candidateId,
      positionId: this.form.value.positionId!,
      interviewerIds: this.form.value.interviewerIds!,
      date,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      type: this.form.value.type
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMsg = 'Interview scheduled successfully!';
        this.adminService.fetchInterviews();
        setTimeout(() => this.router.navigate(['/admin/dashboard']), 1200);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg = err.error?.message || 'Failed to schedule interview';
      }
    });
  }
}

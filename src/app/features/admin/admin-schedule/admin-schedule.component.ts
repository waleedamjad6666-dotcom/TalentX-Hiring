import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiCreateInterviewRound } from '../../../core/models';

interface MockRound {
  id: number;
  interviewerIds: string[];
  type: string;
  duration: string;
  date: string;
  time: string;
}

@Component({
  selector: 'app-admin-schedule',
  imports: [ReactiveFormsModule, FormsModule, DatePipe, RouterLink],
  templateUrl: './admin-schedule.component.html'
})
export class AdminScheduleComponent implements OnInit {
  adminService = inject(AdminService);
  router = inject(Router);

  submitting = signal(false);
  errorMsg = '';
  successMsg = '';

  rounds: MockRound[] = [];
  private nextRoundId = 2;
  maxRounds = 5;

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

    for (const round of this.rounds) {
      if (!this.isRoundValid(round)) {
        this.errorMsg = `Round ${round.id}: each additional round requires at least one interviewer and a duration.`;
        return;
      }
    }

    this.submitting.set(true);
    this.errorMsg = '';
    this.successMsg = '';

    const rounds: ApiCreateInterviewRound[] = [
      this.buildRoundPayload(
        this.form.value.interviewerIds!,
        this.form.value.type || 'Technical Assessment',
        Number(this.form.value.duration),
        this.form.value.date!,
        this.form.value.time!
      )
    ];

    for (const round of this.rounds) {
      rounds.push(this.buildRoundPayload(
        round.interviewerIds,
        round.type,
        Number(round.duration),
        round.date,
        round.time
      ));
    }

    this.createInterview(this.form.value.candidateId!, rounds);
  }

  private buildRoundPayload(
    interviewerIds: string[],
    type: string,
    duration: number,
    date: string,
    time: string
  ): ApiCreateInterviewRound {
    const payload: ApiCreateInterviewRound = { interviewerIds, type, duration };
    if (date && time) {
      const startTime = new Date(`${date}T${time}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      payload.date = date;
      payload.startTime = startTime.toISOString();
      payload.endTime = endTime.toISOString();
    }
    return payload;
  }

  addRound() {
    if (this.rounds.length >= this.maxRounds) return;
    this.rounds.push({
      id: this.nextRoundId++,
      interviewerIds: [],
      type: 'Technical Assessment',
      duration: '45',
      date: '',
      time: ''
    });
  }

  removeRound(index: number) {
    this.rounds.splice(index, 1);
  }

  previewRoundInterviewers(round: MockRound) {
    const ids = round.interviewerIds || [];
    const names = ids.map(id => {
      const i = this.adminService.interviewers().find(x => x.id === id);
      return i ? `${i.firstname} ${i.lastname}` : null;
    }).filter(Boolean);
    return names.length ? names.join(', ') : '-';
  }

  isRoundValid(round: MockRound) {
    return round.interviewerIds.length > 0 && round.duration;
  }

  canAddRound() {
    return this.rounds.length < this.maxRounds;
  }

  private createInterview(candidateId: string, rounds: ApiCreateInterviewRound[]) {
    this.adminService.createInterview({
      candidateId,
      positionId: this.form.value.positionId!,
      rounds
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

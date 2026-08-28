import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
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
  schedulingMode = signal(false);
  errorMsg = '';
  successMsg = '';

  rounds: MockRound[] = [];
  private nextRoundId = 2;
  maxRounds = 5;

  get todayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

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

  toggleSchedulingMode() {
    const newVal = !this.schedulingMode();
    this.schedulingMode.set(newVal);

    if (newVal) {
      this.form.controls.date.clearValidators();
      this.form.controls.date.updateValueAndValidity();
      this.form.controls.time.clearValidators();
      this.form.controls.time.updateValueAndValidity();
      this.form.patchValue({ date: '', time: '' });
    } else {
      this.form.controls.date.setValidators(Validators.required);
      this.form.controls.date.updateValueAndValidity();
      this.form.controls.time.setValidators(Validators.required);
      this.form.controls.time.updateValueAndValidity();
    }
  }

  isFormValid() {
    if (!this.form.value.positionId) return false;
    if (!this.schedulingMode()) {
      if (!this.form.value.date || !this.form.value.time) return false;
    }
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

    if (!this.schedulingMode()) {
      const now = new Date();
      const mainDateTime = new Date(`${this.form.value.date}T${this.form.value.time}`);
      if (mainDateTime < now) {
        this.errorMsg = 'Round 1: Date and time cannot be in the past.';
        return;
      }

      for (const round of this.rounds) {
        if (!this.isRoundValid(round)) {
          this.errorMsg = `Round ${round.id}: each additional round requires at least one interviewer and a duration.`;
          return;
        }
        if (round.date && round.time) {
          const roundDateTime = new Date(`${round.date}T${round.time}`);
          if (roundDateTime < now) {
            this.errorMsg = `Round ${round.id}: Date and time cannot be in the past.`;
            return;
          }
        }
      }
    }

    this.submitting.set(true);
    this.errorMsg = '';
    this.successMsg = '';

    const rounds: ApiCreateInterviewRound[] = [];

    if (this.schedulingMode()) {
      rounds.push({
        interviewerIds: this.form.value.interviewerIds!,
        type: this.form.value.type || 'Technical Assessment',
        duration: Number(this.form.value.duration)
      });

      for (const round of this.rounds) {
        if (!round.interviewerIds || round.interviewerIds.length === 0) {
          this.errorMsg = `Round ${round.id}: at least one interviewer is required.`;
          this.submitting.set(false);
          return;
        }
        rounds.push({
          interviewerIds: round.interviewerIds,
          type: round.type || 'Technical Assessment',
          duration: Number(round.duration)
        });
      }
    } else {
      rounds.push(
        this.buildRoundPayload(
          this.form.value.interviewerIds!,
          this.form.value.type || 'Technical Assessment',
          Number(this.form.value.duration),
          this.form.value.date!,
          this.form.value.time!
        )
      );

      for (const round of this.rounds) {
        rounds.push(this.buildRoundPayload(
          round.interviewerIds,
          round.type,
          Number(round.duration),
          round.date,
          round.time
        ));
      }
    }

    const payload: any = {
      candidateId: this.form.value.candidateId!,
      positionId: this.form.value.positionId!,
      rounds
    };

    if (this.schedulingMode()) {
      payload.schedulingMode = true;
      payload.duration = Number(this.form.value.duration);
    }

    this.createInterview(this.form.value.candidateId!, payload);
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

  private createInterview(candidateId: string, payload: any) {
    this.adminService.createInterview(payload).subscribe({
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

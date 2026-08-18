import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ApiInterview, ApiCreateInterviewRound } from '../../../core/models';

interface MockRound {
  id: number;
  interviewerIds: string[];
  type: string;
  duration: string;
  date: string;
  time: string;
}

@Component({
  selector: 'app-interview-modal',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './interview-modal.component.html'
})
export class InterviewModalComponent implements OnInit {
  adminService = inject(AdminService);

  @Input() interview: ApiInterview | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  isSubmitting = signal(false);
  isEditMode = signal(false);
  errorMsg = signal<string | null>(null);

  rounds: MockRound[] = [];
  private nextRoundId = 2;
  maxRounds = 5;

  get todayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  form = new FormGroup({
    candidateId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    positionId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    interviewerIds: new FormControl<string[]>([], { nonNullable: true }),
    date: new FormControl('', { nonNullable: true, validators: Validators.required }),
    time: new FormControl('', { nonNullable: true, validators: Validators.required }),
    duration: new FormControl('45', { nonNullable: true }),
    type: new FormControl('Technical Assessment', { nonNullable: true })
  });

  ngOnInit() {
    this.adminService.loadScheduleData();

    if (this.interview) {
      this.isEditMode.set(true);
      const inv = this.interview;

      const firstRound = inv.rounds && inv.rounds.length > 0 ? inv.rounds[0] : null;

      const r1InterviewerIds = firstRound
        ? (firstRound.interviewerIds || firstRound.interviewers?.map(i => i.id) || [])
        : (inv.interviewerIds || inv.interviewers?.map(i => i.id) || []);

      const r1Date = firstRound?.date || inv.date || (inv.startTime ? this.extractDate(inv.startTime) : '');
      const r1Time = firstRound?.startTime ? this.extractTime(firstRound.startTime) : (inv.startTime ? this.extractTime(inv.startTime) : '');
      const r1Type = firstRound?.type || inv.type || 'Technical Assessment';
      const r1Duration = firstRound?.duration ? String(firstRound.duration) : '45';

      this.form.patchValue({
        candidateId: inv.candidateId || inv.candidate?.id || '',
        positionId: inv.positionId || inv.position?.id || '',
        interviewerIds: r1InterviewerIds,
        date: r1Date,
        time: r1Time,
        duration: r1Duration,
        type: r1Type
      });

      if (inv.rounds && inv.rounds.length > 1) {
        for (let i = 1; i < inv.rounds.length; i++) {
          const r = inv.rounds[i];
          this.rounds.push({
            id: this.nextRoundId++,
            interviewerIds: r.interviewerIds || r.interviewers?.map(x => x.id) || [],
            type: r.type || 'Technical Assessment',
            duration: String(r.duration || 45),
            date: r.date || (r.startTime ? this.extractDate(r.startTime) : ''),
            time: r.startTime ? this.extractTime(r.startTime) : ''
          });
        }
      }
    }
  }

  private extractDate(dateTimeStr: string): string {
    try {
      const d = new Date(dateTimeStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  }

  private extractTime(dateTimeStr: string): string {
    try {
      const d = new Date(dateTimeStr);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  }

  close() {
    this.closed.emit();
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close();
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

  canAddRound() {
    return this.rounds.length < this.maxRounds;
  }

  isFormValid() {
    if (!this.form.value.date || !this.form.value.time || !this.form.value.positionId) return false;
    if (!this.form.value.interviewerIds || this.form.value.interviewerIds.length === 0) return false;
    return !!this.form.value.candidateId;
  }

  isRoundValid(round: MockRound) {
    return round.interviewerIds.length > 0 && round.duration;
  }

  submit() {
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.errorMsg.set(null);

    const roundsPayload: ApiCreateInterviewRound[] = [
      this.buildRoundPayload(
        this.form.value.interviewerIds!,
        this.form.value.type || 'Technical Assessment',
        Number(this.form.value.duration),
        this.form.value.date!,
        this.form.value.time!
      )
    ];

    for (const round of this.rounds) {
      if (!this.isRoundValid(round)) {
        this.errorMsg.set(`Round ${round.id}: each additional round requires at least one interviewer and a duration.`);
        return;
      }
      roundsPayload.push(this.buildRoundPayload(
        round.interviewerIds,
        round.type,
        Number(round.duration),
        round.date,
        round.time
      ));
    }

    this.isSubmitting.set(true);

    const payload = {
      candidateId: this.form.value.candidateId!,
      positionId: this.form.value.positionId!,
      rounds: roundsPayload
    };

    if (this.isEditMode() && this.interview) {
      this.adminService.updateInterview(this.interview.id, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMsg.set(err.error?.message || 'Failed to update interview');
        }
      });
    } else {
      this.adminService.createInterview(payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMsg.set(err.error?.message || 'Failed to schedule interview');
        }
      });
    }
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
}

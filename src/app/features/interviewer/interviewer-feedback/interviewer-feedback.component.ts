import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewerService } from '../../../core/services/interviewer.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { getInitials } from '../../../shared/utils';
import { ApiInterviewRound, FeedbackResponse } from '../../../core/models';

@Component({
  selector: 'app-interviewer-feedback',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './interviewer-feedback.component.html'
})
export class InterviewerFeedbackComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  interviewerService = inject(InterviewerService);
  authService = inject(AuthService);

  interviewId = this.route.snapshot.paramMap.get('id') || '';
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  alreadySubmitted = signal(false);
  existingFeedback = signal<FeedbackResponse | null>(null);
  interviewNotStarted = signal(false);

  roundId = signal<string | null>(null);
  allFeedback = signal<FeedbackResponse[]>([]);

  rating = signal(0);

  form = new FormGroup({
    recommended: new FormControl('', { nonNullable: true }),
    positive: new FormControl('', { nonNullable: true }),
    negative: new FormControl('', { nonNullable: true }),
    additional: new FormControl('', { nonNullable: true })
  });

  constructor() {
    effect(() => {
      const start = this.selectedRound()?.startTime || this.interview?.startTime || null;
      this.interviewNotStarted.set(!!start && new Date(start) > new Date());

      const rid = this.selectedRound()?.id;
      const fb = this.allFeedback();
      const found = rid ? fb.find(f => f.roundId === rid) : (fb[0] || null);
      this.existingFeedback.set(found || null);
      this.alreadySubmitted.set(!!found);
      if (found) {
        this.populateForm(found);
      } else {
        this.resetForm();
      }
    });
  }

  ngOnInit() {
    this.interviewerService.fetchInterviews();
    this.checkExistingFeedback();
  }

  get interview() {
    return this.interviewerService.interviews().find(i => i.id === this.interviewId) || null;
  }

  get candidate() {
    return this.interview?.candidate || null;
  }

  myRounds(): ApiInterviewRound[] {
    const uid = this.authService.currentUser()?.id;
    if (!this.interview || !uid) return [];
    return (this.interview.rounds || []).filter(r => r.interviewerIds.includes(uid));
  }

  hasRounds(): boolean {
    return (this.interview?.rounds?.length || 0) > 0;
  }

  selectedRound(): ApiInterviewRound | undefined {
    const rounds = this.myRounds();
    return rounds.find(r => r.id === this.roundId()) || rounds[0];
  }

  selectedRoundLabel(): string {
    const inv = this.interview;
    const round = this.selectedRound();
    if (round && inv?.rounds?.length) {
      return `Round ${round.roundNumber} of ${inv.rounds.length}`;
    }
    return `Round ${inv?.round ?? 1}`;
  }

  selectRound(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this.roundId.set(value || null);
  }

  getInitials(firstname: string | undefined, lastname: string | undefined) {
    return getInitials(firstname, lastname);
  }

  checkExistingFeedback() {
    this.loading.set(true);
    this.interviewerService.getFeedback(this.interviewId).subscribe({
      next: (res) => {
        const list = Array.isArray(res.feedback) ? res.feedback : (res.feedback ? [res.feedback] : []);
        this.allFeedback.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  populateForm(feedback: FeedbackResponse) {
    this.rating.set(feedback.rating);
    this.form.patchValue({
      recommended: feedback.recommendation,
      positive: feedback.positiveComments,
      negative: feedback.negativeComments,
      additional: feedback.additionalComments
    });
  }

  resetForm() {
    this.rating.set(0);
    this.form.reset();
  }

  submit() {
    if (!this.rating() || !this.form.value.recommended) return;

    if (this.hasRounds() && !this.selectedRound()?.id) {
      this.error.set('Unable to determine the round for this interview.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;
    this.interviewerService.submitFeedback({
      interviewId: this.interviewId,
      roundId: this.hasRounds() ? this.selectedRound()!.id : undefined,
      rating: this.rating(),
      recommendation: v.recommended as 'Yes' | 'No' | 'Hold',
      positiveComments: v.positive!,
      negativeComments: v.negative!,
      additionalComments: v.additional || ''
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/interviewer/dashboard']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to submit feedback');
      }
    });
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InterviewerService } from '../../../core/services/interviewer.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { getInitials } from '../../../shared/utils';

@Component({
  selector: 'app-interviewer-feedback',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './interviewer-feedback.component.html'
})
export class InterviewerFeedbackComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  interviewerService = inject(InterviewerService);

  interviewId = this.route.snapshot.paramMap.get('id') || '';
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  alreadySubmitted = signal(false);
  existingFeedback = signal<any>(null);

  rating = signal(0);

  form = new FormGroup({
    recommended: new FormControl('', { nonNullable: true }),
    positive: new FormControl('', { nonNullable: true }),
    negative: new FormControl('', { nonNullable: true }),
    additional: new FormControl('', { nonNullable: true })
  });

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

  getInitials(firstname: string | undefined, lastname: string | undefined) {
    return getInitials(firstname, lastname);
  }

  checkExistingFeedback() {
    this.loading.set(true);
    this.interviewerService.getFeedback(this.interviewId).subscribe({
      next: (res) => {
        if (res.feedback) {
          this.alreadySubmitted.set(true);
          this.existingFeedback.set(res.feedback);
          this.populateForm(res.feedback);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  populateForm(feedback: any) {
    this.rating.set(feedback.rating);
    this.form.patchValue({
      recommended: feedback.recommendation,
      positive: feedback.positiveComments,
      negative: feedback.negativeComments,
      additional: feedback.additionalComments
    });
  }

  submit() {
    if (!this.rating() || !this.form.value.recommended) return;

    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;
    this.interviewerService.submitFeedback({
      interviewId: this.interviewId,
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

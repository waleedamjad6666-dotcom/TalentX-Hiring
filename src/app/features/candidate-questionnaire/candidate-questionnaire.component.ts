import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PublicQuestionnaireResponse, SubmitQuestionnaireRequest, SubmitQuestionnaireResponse } from '../../core/models';

type SubmissionState = 'pending' | 'submitting' | 'submitted_interested' | 'submitted_declined' | 'error';

@Component({
  selector: 'app-candidate-questionnaire',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './candidate-questionnaire.component.html'
})
export class CandidateQuestionnaireComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  token = signal<string>('');
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  candidateName = signal<string>('');
  questions = signal<string[]>([]);
  answers = signal<Record<string, string>>({});

  isInterested = signal<boolean | null>(null);
  submissionState = signal<SubmissionState>('pending');
  calendlyLink = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const token = params.get('token');
      if (token) {
        this.token.set(token);
        this.fetchQuestionnaire(token);
      } else {
        this.loading.set(false);
        this.errorMessage.set('Invalid or missing questionnaire token.');
      }
    });
  }

  fetchQuestionnaire(token: string) {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.http.get<PublicQuestionnaireResponse>(`/api/candidate/questionnaire/${token}`).subscribe({
      next: (res) => {
        this.candidateName.set(res.candidateName);
        this.questions.set(res.questions);

        // Initialize answers dictionary
        const initialAnswers: Record<string, string> = {};
        res.questions.forEach(q => {
          initialAnswers[q] = '';
        });
        this.answers.set(initialAnswers);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Unable to load questionnaire. It may have expired or already been submitted.');
      }
    });
  }

  setInterest(interested: boolean) {
    this.isInterested.set(interested);
  }

  updateAnswer(question: string, value: string) {
    this.answers.update(prev => ({
      ...prev,
      [question]: value
    }));
  }

  isFormComplete(): boolean {
    if (this.isInterested() === false) return true;
    if (this.isInterested() !== true) return false;

    const currentAnswers = this.answers();
    return this.questions().every(q => currentAnswers[q] && currentAnswers[q].trim().length > 0);
  }

  submit() {
    if (this.isInterested() === null) return;
    if (this.isInterested() && !this.isFormComplete()) return;

    this.submissionState.set('submitting');
    this.errorMessage.set(null);

    const payload: SubmitQuestionnaireRequest = {
      isInterested: this.isInterested() === true
    };

    if (this.isInterested()) {
      payload.answers = this.answers();
    }

    this.http.post<SubmitQuestionnaireResponse>(`/api/candidate/questionnaire/${this.token()}/submit`, payload).subscribe({
      next: (res) => {
        if (this.isInterested()) {
          this.calendlyLink.set(res.calendlyLink || null);
          this.submissionState.set('submitted_interested');
        } else {
          this.submissionState.set('submitted_declined');
        }
      },
      error: (err) => {
        this.submissionState.set('error');
        this.errorMessage.set(err.error?.message || 'Failed to submit questionnaire. Please try again.');
      }
    });
  }
}

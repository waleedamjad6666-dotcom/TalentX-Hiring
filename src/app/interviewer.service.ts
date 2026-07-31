import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  ApiInterview,
  ApiInterviewsResponse,
  ApiCandidateResponse,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
  GetFeedbackResponse
} from './models';
@Injectable({ providedIn: 'root' })
export class InterviewerService {
  private http = inject(HttpClient);

  interviews = signal<ApiInterview[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  fetchInterviews() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ApiInterviewsResponse>('/api/interviewer/interviews').subscribe({
      next: (res) => {
        this.interviews.set(res.interviews);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to fetch interviews');
        this.loading.set(false);
      }
    });
  }
  
  candidate = signal<ApiCandidateResponse['candidate'] | null>(null);
  candidateLoading = signal<boolean>(false);
  candidateError = signal<string | null>(null);

  fetchCandidate(id: string) {
    this.candidateLoading.set(true);
    this.candidateError.set(null);

    this.http.get<ApiCandidateResponse>(`/api/interviewer/candidate/${id}`).subscribe({
      next: (res) => {
        this.candidate.set(res.candidate);
        this.candidateLoading.set(false);
      },
      error: (err) => {
        this.candidateError.set(err.error?.message || 'Failed to fetch candidate details');
        this.candidateLoading.set(false);
      }
    });
  }

  clearCandidate() {
    this.candidate.set(null);
    this.candidateLoading.set(false);
    this.candidateError.set(null);
  }

  submitFeedback(data: SubmitFeedbackRequest): Observable<SubmitFeedbackResponse> {
    return this.http.post<SubmitFeedbackResponse>('/api/interviewer/feedback', data).pipe(
      tap(() => this.fetchInterviews())
    );
  }

  getFeedback(interviewId: string): Observable<GetFeedbackResponse> {
    return this.http.get<GetFeedbackResponse>(`/api/interviewer/feedback/${interviewId}`);
  }
}

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiInterview, ApiInterviewsResponse } from './models';

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
}

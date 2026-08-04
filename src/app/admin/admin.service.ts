import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  ApiCandidate,
  ApiInterview,
  ApiInterviewer,
  ApiPositionWithDepartment,
  ApiCandidatesResponse,
  ApiInterviewersResponse,
  ApiPositionsResponse,
  ApiInterviewsListResponse,
  ApiCreateCandidateRequest,
  ApiCreateCandidateResponse,
  ApiCreateInterviewRequest,
  ApiCreateInterviewResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  candidates = signal<ApiCandidate[]>([]);
  interviewers = signal<ApiInterviewer[]>([]);
  positions = signal<ApiPositionWithDepartment[]>([]);
  interviews = signal<ApiInterview[]>([]);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  loadScheduleData() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ApiCandidatesResponse>('/api/admin/candidates').subscribe({
      next: (res) => {
        this.candidates.set(res.candidates);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load candidates');
        this.loading.set(false);
      }
    });

    this.http.get<ApiInterviewersResponse>('/api/admin/interviewers').subscribe({
      next: (res) => this.interviewers.set(res.interviewers),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load interviewers');
        this.loading.set(false);
      }
    });

    this.http.get<ApiPositionsResponse>('/api/admin/positions').subscribe({
      next: (res) => this.positions.set(res.positions),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load positions');
        this.loading.set(false);
      }
    });
  }

  fetchCandidates() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<ApiCandidatesResponse>('/api/admin/candidates').subscribe({
      next: (res) => {
        this.candidates.set(res.candidates);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load candidates');
        this.loading.set(false);
      }
    });
  }

  fetchInterviews() {
    this.http.get<ApiInterviewsListResponse>('/api/admin/interviews').subscribe({
      next: (res) => this.interviews.set(res.interviews),
      error: (err) => this.error.set(err.error?.message || 'Failed to load interviews')
    });
  }

  createCandidate(data: ApiCreateCandidateRequest): Observable<ApiCreateCandidateResponse>;
  createCandidate(formData: FormData): Observable<any>;
  createCandidate(data: ApiCreateCandidateRequest | FormData): Observable<ApiCreateCandidateResponse | any> {
    return this.http.post('/api/admin/candidates', data);
  }

  createInterview(data: ApiCreateInterviewRequest): Observable<ApiCreateInterviewResponse> {
    return this.http.post<ApiCreateInterviewResponse>('/api/admin/interviews', data);
  }
}

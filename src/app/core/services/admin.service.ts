import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  ApiCandidate,
  ApiInterview,
  ApiInterviewer,
  ApiDepartment,
  ApiPositionWithDepartment,
  ApiCandidatesResponse,
  ApiInterviewersResponse,
  ApiPositionsResponse,
  ApiDepartmentsResponse,
  ApiInterviewsListResponse,
  ApiCreateCandidateRequest,
  ApiCreateCandidateResponse,
  ApiCreateInterviewRequest,
  ApiCreateInterviewResponse,
  ApiCreateUserRequest,
  ApiCreateUserResponse,
  ApiCreatePositionRequest,
  ApiCreatePositionResponse,
  ApiUpdateDecisionRequest,
  ApiUpdateDecisionResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  candidates = signal<ApiCandidate[]>([]);
  interviewers = signal<ApiInterviewer[]>([]);
  positions = signal<ApiPositionWithDepartment[]>([]);
  departments = signal<ApiDepartment[]>([]);
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

  loadDepartments() {
    this.http.get<ApiDepartmentsResponse>('/api/admin/departments').subscribe({
      next: (res) => this.departments.set(res.departments),
      error: (err) => this.error.set(err.error?.message || 'Failed to load departments')
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

  createUser(data: ApiCreateUserRequest): Observable<ApiCreateUserResponse> {
    return this.http.post<ApiCreateUserResponse>('/api/admin/users', data);
  }

  createPosition(data: ApiCreatePositionRequest): Observable<ApiCreatePositionResponse> {
    return this.http.post<ApiCreatePositionResponse>('/api/admin/positions', data);
  }

  updateInterviewDecision(interviewId: string, decision: ApiUpdateDecisionRequest['decision']): Observable<ApiUpdateDecisionResponse> {
    return this.http.patch<ApiUpdateDecisionResponse>(`/api/admin/interviews/${interviewId}/decision`, { decision }).pipe(
      tap((res) => {
        this.interviews.update(list => list.map(i => i.id === res.interview.id ? { ...i, decision: res.interview.decision, decisionUpdatedAt: res.interview.decisionUpdatedAt } : i));
      })
    );
  }
}

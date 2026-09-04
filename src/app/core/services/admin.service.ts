import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  ApiCandidate,
  ApiInterview,
  ApiInterviewer,
  ApiDepartment,
  ApiPositionWithDepartment,
  ApiVacancy,
  ApiCandidatesResponse,
  ApiInterviewersResponse,
  ApiPositionsResponse,
  ApiPositionsWithStatsResponse,
  ApiDepartmentsResponse,
  ApiInterviewsListResponse,
  ApiCreateCandidateRequest,
  ApiCreateCandidateResponse,
  ApiUpdateCandidateRequest,
  ApiUpdateCandidateResponse,
  ApiDeleteCandidateResponse,
  ApiCandidateDetailResponse,
  ApiCreateInterviewRequest,
  ApiCreateInterviewResponse,
  ApiCreateUserRequest,
  ApiCreateUserResponse,
  ApiCreatePositionRequest,
  ApiCreatePositionResponse,
  ApiUpdatePositionRequest,
  ApiUpdatePositionResponse,
  ApiUpdateDecisionRequest,
  ApiUpdateDecisionResponse,
  ApiRoundsResponse,
  ApiAddRoundsResponse,
  ApiUpdateRoundScheduleResponse,
  ApiCancelRoundResponse,
  ApiCreateInterviewRound,
  BatchMatchingResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  candidates = signal<ApiCandidate[]>([]);
  interviewers = signal<ApiInterviewer[]>([]);
  positions = signal<ApiPositionWithDepartment[]>([]);
  departments = signal<ApiDepartment[]>([]);
  interviews = signal<ApiInterview[]>([]);
  vacancies = signal<ApiVacancy[]>([]);

  loading = signal<boolean>(false);
  loadingVacancies = signal<boolean>(false);
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

  loadVacancies() {
    this.loadingVacancies.set(true);
    this.error.set(null);
    this.http.get<ApiPositionsWithStatsResponse>('/api/admin/positions').subscribe({
      next: (res) => {
        this.vacancies.set(res.positions);
        this.loadingVacancies.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load vacancies');
        this.loadingVacancies.set(false);
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

  updateInterview(id: string, data: any): Observable<any> {
    return this.http.put<any>(`/api/admin/interviews/${id}`, data);
  }

  deleteInterview(id: string): Observable<any> {
    return this.http.delete<any>(`/api/admin/interviews/${id}`);
  }

  getInterviewRounds(interviewId: string): Observable<ApiRoundsResponse> {
    return this.http.get<ApiRoundsResponse>(`/api/admin/interviews/${interviewId}/rounds`);
  }

  addInterviewRounds(interviewId: string, rounds: ApiCreateInterviewRound[]): Observable<ApiAddRoundsResponse> {
    return this.http.post<ApiAddRoundsResponse>(`/api/admin/interviews/${interviewId}/rounds`, { rounds });
  }

  updateRoundSchedule(
    interviewId: string,
    roundId: string,
    schedule: { date: string; startTime: string; endTime: string }
  ): Observable<ApiUpdateRoundScheduleResponse> {
    return this.http.patch<ApiUpdateRoundScheduleResponse>(
      `/api/admin/interviews/${interviewId}/rounds/${roundId}/schedule`,
      schedule
    );
  }

  cancelRound(interviewId: string, roundId: string): Observable<ApiCancelRoundResponse> {
    return this.http.patch<ApiCancelRoundResponse>(
      `/api/admin/interviews/${interviewId}/rounds/${roundId}/cancel`,
      {}
    );
  }

  createUser(data: ApiCreateUserRequest): Observable<ApiCreateUserResponse> {
    return this.http.post<ApiCreateUserResponse>('/api/admin/users', data);
  }

  createPosition(data: ApiCreatePositionRequest): Observable<ApiCreatePositionResponse> {
    return this.http.post<ApiCreatePositionResponse>('/api/admin/positions', data);
  }

  updatePosition(id: string, data: ApiUpdatePositionRequest): Observable<ApiUpdatePositionResponse> {
    return this.http.put<ApiUpdatePositionResponse>(`/api/admin/positions/${id}`, data).pipe(
      tap(() => {
        this.loadVacancies();
        this.loadScheduleData();
      })
    );
  }

  updateInterviewDecision(interviewId: string, decision: ApiUpdateDecisionRequest['decision']): Observable<ApiUpdateDecisionResponse> {
    return this.http.patch<ApiUpdateDecisionResponse>(`/api/admin/interviews/${interviewId}/decision`, { decision }).pipe(
      tap((res) => {
        this.interviews.update(list => list.map(i => i.id === res.interview.id ? { ...i, decision: res.interview.decision, decisionUpdatedAt: res.interview.decisionUpdatedAt } : i));
      })
    );
  }

  resumeInterview(interviewId: string): Observable<ApiUpdateDecisionResponse> {
    return this.http.patch<ApiUpdateDecisionResponse>(`/api/admin/interviews/${interviewId}/resume`, {}).pipe(
      tap(() => {
        this.fetchInterviews();
      })
    );
  }

  updateRoundDecision(interviewId: string, roundId: string, decision: ApiUpdateDecisionRequest['decision']): Observable<any> {
    return this.http.patch<any>(`/api/admin/interviews/${interviewId}/rounds/${roundId}/decision`, { decision }).pipe(
      tap(() => {
        this.fetchInterviews();
      })
    );
  }

  fetchCandidate(id: string): Observable<ApiCandidateDetailResponse> {
    return this.http.get<ApiCandidateDetailResponse>(`/api/admin/candidates/${id}`);
  }

  updateCandidate(id: string, data: ApiUpdateCandidateRequest): Observable<ApiUpdateCandidateResponse> {
    return this.http.put<ApiUpdateCandidateResponse>(`/api/admin/candidates/${id}`, data);
  }

  deleteCandidate(id: string): Observable<ApiDeleteCandidateResponse> {
    return this.http.delete<ApiDeleteCandidateResponse>(`/api/admin/candidates/${id}`);
  }

  downloadResume(id: string): Observable<Blob> {
    return this.http.get(`/api/admin/candidates/${id}/resume`, {
      responseType: 'blob'
    });
  }

  bulkMatchResumes(positionId: string, files: File[]): Observable<BatchMatchingResponse> {
    const formData = new FormData();
    formData.append('positionId', positionId);
    files.forEach(file => {
      formData.append('resumes', file, file.name);
    });
    return this.http.post<BatchMatchingResponse>('/api/admin/candidates/bulk-match', formData);
  }
}


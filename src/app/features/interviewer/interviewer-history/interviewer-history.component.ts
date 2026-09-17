import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { InterviewerService } from '../../../core/services/interviewer.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiInterview } from '../../../core/models';
import { formatDateLocal } from '../../../shared/utils';

type HistoryFilter = 'all' | 'hired' | 'rejected';

@Component({
  selector: 'app-interviewer-history',
  templateUrl: './interviewer-history.component.html'
})
export class InterviewerHistoryComponent implements OnInit, OnDestroy {
  interviewerService = inject(InterviewerService);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  search = signal('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');
  sortColumn = signal<string>('date');
  sortDirection = signal<'asc' | 'desc'>('desc');
  statusFilter = signal<HistoryFilter>('all');

  filterOptions: { value: HistoryFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: 'list_alt' },
    { value: 'hired', label: 'Recommended', icon: 'thumb_up' },
    { value: 'rejected', label: 'Not Recommended', icon: 'person_remove' }
  ];

  private querySub: Subscription | null = null;

  filterLabel(filter: HistoryFilter): string {
    switch (filter) {
      case 'hired': return 'Recommended for Hire';
      case 'rejected': return 'Not Recommended';
      default: return 'All Completed';
    }
  }

  filterDescription(filter: HistoryFilter): string {
    switch (filter) {
      case 'hired': return 'Interviews you recommended for hire.';
      case 'rejected': return 'Interviews you did not recommend for hire.';
      default: return 'All completed interviews and evaluations.';
    }
  }

  myRecommendation(interview: ApiInterview): string | null {
    const uid = this.authService.currentUser()?.id;
    if (!uid) return null;

    const directFb = (interview.interviewFeedbacks || []).find(f => f.interviewerId === uid);
    if (directFb?.recommendation) return directFb.recommendation;

    const myRounds = (interview.rounds || []).filter(r => r.interviewerIds.includes(uid));
    for (const round of myRounds) {
      const roundFb = (round.interviewFeedbacks || []).find(f => f.interviewerId === uid);
      if (roundFb?.recommendation) return roundFb.recommendation;
    }

    for (const round of interview.rounds || []) {
      const roundFb = (round.interviewFeedbacks || []).find(f => f.interviewerId === uid);
      if (roundFb?.recommendation) return roundFb.recommendation;
    }

    return null;
  }

  myRound(interview: ApiInterview) {
    const uid = this.authService.currentUser()?.id;
    if (!uid) return undefined;
    return (interview.rounds || []).find(r => r.interviewerIds.includes(uid));
  }

  interviewRoundLabel(interview: ApiInterview): string {
    const round = this.myRound(interview);
    if (round && interview.rounds?.length) {
      return `Round ${round.roundNumber} of ${interview.rounds.length}`;
    }
    return `Round ${interview.round}`;
  }

  interviewType(interview: ApiInterview): string | null {
    const round = this.myRound(interview);
    return round?.type || interview.type || null;
  }

  interviewDate(interview: ApiInterview): string {
    return this.myRound(interview)?.date || interview.date;
  }

  formatDateLocal(dateStr?: string | null): string {
    return formatDateLocal(dateStr);
  }

  interviewStartTime(interview: ApiInterview): string {
    return this.myRound(interview)?.startTime || interview.startTime;
  }

  interviewStatus(interview: ApiInterview): string {
    return this.myRound(interview)?.status || interview.status;
  }

  ngOnInit() {
    this.interviewerService.fetchInterviews();
    this.querySub = this.route.queryParams.subscribe(params => {
      const filter = params['filter'];
      if (filter === 'all' || filter === 'hired' || filter === 'rejected') {
        this.statusFilter.set(filter as HistoryFilter);
      } else {
        this.statusFilter.set('all');
      }
    });
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
  }

  completedInterviews = computed(() => {
    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    return this.interviewerService.interviews()
      .filter(i => i.status === 'completed')
      .sort((a, b) => {
        let valA: any, valB: any;
        switch (col) {
          case 'candidate':
            valA = `${a.candidate.firstname} ${a.candidate.lastname}`.toLowerCase();
            valB = `${b.candidate.firstname} ${b.candidate.lastname}`.toLowerCase();
            break;
          case 'position':
            valA = a.position.title.toLowerCase();
            valB = b.position.title.toLowerCase();
            break;
          case 'date':
            valA = new Date(a.startTime).getTime();
            valB = new Date(b.startTime).getTime();
            break;
          case 'round':
            valA = a.round;
            valB = b.round;
            break;
          case 'type':
            valA = (a.type || '').toLowerCase();
            valB = (b.type || '').toLowerCase();
            break;
          case 'status':
            valA = a.status.toLowerCase();
            valB = b.status.toLowerCase();
            break;
          default:
            valA = new Date(a.startTime).getTime();
            valB = new Date(b.startTime).getTime();
        }
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
  });

  hiredCount = computed(() => this.completedInterviews().filter(i => this.myRecommendation(i) === 'Yes').length);
  rejectedCount = computed(() => this.completedInterviews().filter(i => this.myRecommendation(i) === 'No').length);

  filterCount(filter: HistoryFilter): number {
    switch (filter) {
      case 'hired': return this.hiredCount();
      case 'rejected': return this.rejectedCount();
      default: return this.completedInterviews().length;
    }
  }

  filteredInterviews = computed(() => {
    const s = this.search().toLowerCase();
    const from = this.dateFrom();
    const to = this.dateTo();
    const f = this.statusFilter();
    return this.completedInterviews().filter(i => {
      const candidateName = `${i.candidate.firstname} ${i.candidate.lastname}`.toLowerCase();
      const positionTitle = i.position.title.toLowerCase();
      const round = String(i.round);
      const type = (i.type || '').toLowerCase();
      const status = i.status.toLowerCase();
      const matchText = !s || candidateName.includes(s) || positionTitle.includes(s) || round.includes(s) || type.includes(s) || status.includes(s);
      const matchFrom = !from || i.date >= from;
      const matchTo = !to || i.date <= to;
      const rec = this.myRecommendation(i);
      const matchFilter = f === 'all' || (f === 'hired' && rec === 'Yes') || (f === 'rejected' && rec === 'No');
      return matchText && matchFrom && matchTo && matchFilter;
    });
  });

  setStatusFilter(f: HistoryFilter) {
    this.statusFilter.set(f);
  }

  updateSearch(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
  }

  updateDateFrom(e: Event) {
    this.dateFrom.set((e.target as HTMLInputElement).value);
  }

  updateDateTo(e: Event) {
    this.dateTo.set((e.target as HTMLInputElement).value);
  }

  clearDates() {
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  toggleSort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set(column === 'date' || column === 'round' ? 'desc' : 'asc');
    }
  }

  sortIcon(column: string): string {
    if (this.sortColumn() !== column) return 'unfold_more';
    return this.sortDirection() === 'asc' ? 'expand_less' : 'expand_more';
  }

  viewFeedback(interviewId: string) {
    this.router.navigate(['/interviewer/feedback', interviewId]);
  }
}

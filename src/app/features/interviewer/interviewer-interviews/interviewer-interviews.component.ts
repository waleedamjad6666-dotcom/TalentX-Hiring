import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InterviewerService } from '../../../core/services/interviewer.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiInterview, ApiInterviewRound } from '../../../core/models';

@Component({
  selector: 'app-interviewer-interviews',
  imports: [RouterLink, DatePipe],
  templateUrl: './interviewer-interviews.component.html'
})
export class InterviewerInterviewsComponent implements OnInit {
  interviewerService = inject(InterviewerService);
  authService = inject(AuthService);
  search = signal('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  ngOnInit() {
    this.interviewerService.fetchInterviews();
  }

  myRounds(interview: ApiInterview): ApiInterviewRound[] {
    const uid = this.authService.currentUser()?.id;
    if (!uid) return [];
    return (interview.rounds || []).filter(r => r.interviewerIds.includes(uid));
  }

  interviewDate(interview: ApiInterview): string {
    return this.myRounds(interview)[0]?.date || interview.date;
  }

  interviewStartTime(interview: ApiInterview): string {
    return this.myRounds(interview)[0]?.startTime || interview.startTime;
  }

  interviewRoundLabel(interview: ApiInterview): string {
    const round = this.myRounds(interview)[0];
    if (round && interview.rounds?.length) {
      return `Round ${round.roundNumber} of ${interview.rounds.length}`;
    }
    return `Round ${interview.round}`;
  }

  interviewType(interview: ApiInterview): string | null {
    const round = this.myRounds(interview)[0];
    return round?.type || interview.type || null;
  }

  roundStatus(interview: ApiInterview): string {
    const status = this.myRounds(interview)[0]?.status || interview.status;
    if (status === 'scheduled' || status === 'pending') {
      const startTime = this.interviewStartTime(interview);
      if (startTime && new Date(startTime) <= new Date()) {
        return 'in-progress';
      }
    }
    return status;
  }

  roundStatusClasses(status: string) {
    switch (status) {
      case 'scheduled': return 'text-xs font-bold text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'in-progress': return 'text-xs font-bold text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'completed': return 'text-xs font-bold text-green-400 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-xs font-bold text-red-400 bg-red-500/10 border-red-500/20';
      case 'pending':
      case 'pending_schedule': return 'text-xs font-bold text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-xs font-bold text-neutral-400 bg-neutral-400/10 border-neutral-400/20';
    }
  }

  canEvaluate(interview: ApiInterview): boolean {
    const start = this.myRounds(interview)[0]?.startTime || interview.startTime;
    return new Date(start) <= new Date();
  }

  scheduledInterviews = computed(() =>
    this.interviewerService.interviews()
      .filter(i => i.status === 'scheduled' || i.status === 'pending_schedule')
      .sort((a, b) => {
        const aIsPending = !a.startTime || a.status === 'pending_schedule';
        const bIsPending = !b.startTime || b.status === 'pending_schedule';
        if (aIsPending && !bIsPending) return 1;
        if (!aIsPending && bIsPending) return -1;
        if (aIsPending && bIsPending) return 0;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      })
  );

  filteredInterviews = computed(() => {
    const s = this.search().toLowerCase();
    const from = this.dateFrom();
    const to = this.dateTo();
    return this.scheduledInterviews().filter(i => {
      const candidateName = `${i.candidate.firstname} ${i.candidate.lastname}`.toLowerCase();
      const positionTitle = i.position.title.toLowerCase();
      const round = String(i.round);
      const type = (i.type || '').toLowerCase();
      const matchText = !s || candidateName.includes(s) || positionTitle.includes(s) || round.includes(s) || type.includes(s);
      const matchFrom = !from || this.interviewDate(i) >= from;
      const matchTo = !to || this.interviewDate(i) <= to;
      return matchText && matchFrom && matchTo;
    });
  });

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
}

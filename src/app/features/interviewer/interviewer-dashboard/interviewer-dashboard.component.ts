import { Component, inject, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { InterviewerService } from '../../../core/services/interviewer.service';
import { RouterLink, Router } from '@angular/router';
import { ApiInterview, ApiInterviewRound } from '../../../core/models';

@Component({
  selector: 'app-interviewer-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './interviewer-dashboard.component.html'
})
export class InterviewerDashboardComponent implements OnInit {
  auth = inject(AuthService);
  interviewerService = inject(InterviewerService);
  router = inject(Router);

  ngOnInit() {
    this.interviewerService.fetchInterviews();
  }

  myRounds(interview: ApiInterview): ApiInterviewRound[] {
    const uid = this.auth.currentUser()?.id;
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

  interviewStatus(interview: ApiInterview): string {
    const status = this.myRounds(interview)[0]?.status || interview.status;
    if (status === 'scheduled' || status === 'pending') {
      const startTime = this.interviewStartTime(interview);
      if (startTime && new Date(startTime) <= new Date()) {
        return 'in-progress';
      }
    }
    return status;
  }

  canEvaluate(interview: ApiInterview): boolean {
    const start = this.myRounds(interview)[0]?.startTime || interview.startTime;
    return new Date(start) <= new Date();
  }

  upcomingInterviews = computed(() =>
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

  dashboardUpcomingInterviews = computed(() => this.upcomingInterviews().slice(0, 2));

  pastInterviews = computed(() =>
    this.interviewerService.interviews()
      .filter(i => i.status === 'completed')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  );

  dashboardPastInterviews = computed(() => this.pastInterviews().slice(0, 3));

  hiredCount = computed(() => this.pastInterviews().filter(i => i.decision === 'hired').length);
  rejectedCount = computed(() => this.pastInterviews().filter(i => i.decision === 'rejected').length);

  viewFeedback(interviewId: string) {
    this.router.navigate(['/interviewer/feedback', interviewId]);
  }
}

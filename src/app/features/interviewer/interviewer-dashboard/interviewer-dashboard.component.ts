import { Component, inject, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { InterviewerService } from '../../../core/services/interviewer.service';
import { RouterLink, Router } from '@angular/router';
import { isInterviewStarted } from '../../../shared/utils';

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

  upcomingInterviews = computed(() =>
    this.interviewerService.interviews()
      .filter(i => i.status === 'scheduled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
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

  isInterviewStarted = isInterviewStarted;
}

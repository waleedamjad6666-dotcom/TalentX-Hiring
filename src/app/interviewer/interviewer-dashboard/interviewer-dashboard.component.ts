import { Component, inject, computed } from '@angular/core';
import { DataService } from '../../data.service';
import { AuthService } from '../../auth.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-interviewer-dashboard',
  imports: [RouterLink],
  templateUrl: './interviewer-dashboard.component.html'
})
export class InterviewerDashboardComponent {
  dataService = inject(DataService);
  auth = inject(AuthService);
  router = inject(Router);

  myInterviews = computed(() => {
     const name = this.auth.currentUser()?.name;
     return this.dataService.interviews().filter(i => i.interviewerName === name);
  });

  upcomingInterviews = computed(() => this.myInterviews().filter(i => i.status === 'Scheduled').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  pastInterviews = computed(() => this.myInterviews().filter(i => i.status === 'Completed').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

  hiredCount = computed(() => this.pastInterviews().filter(i => i.feedback?.recommended === 'Yes').length);
  rejectedCount = computed(() => this.pastInterviews().filter(i => i.feedback?.recommended === 'No').length);

  getCandidate(id: number) {
    return this.dataService.candidates().find(c => c.id === id);
  }

  viewFeedback(interviewId: string) {
    this.router.navigate(['/interviewer/feedback', interviewId]);
  }
}

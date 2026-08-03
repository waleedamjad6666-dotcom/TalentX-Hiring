import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InterviewerService } from '../../interviewer.service';

@Component({
  selector: 'app-interviewer-history',
  templateUrl: './interviewer-history.component.html'
})
export class InterviewerHistoryComponent implements OnInit {
  interviewerService = inject(InterviewerService);
  router = inject(Router);
  search = signal('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  ngOnInit() {
    this.interviewerService.fetchInterviews();
  }

  completedInterviews = computed(() =>
    this.interviewerService.interviews()
      .filter(i => i.status === 'completed')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  );

  filteredInterviews = computed(() => {
    const s = this.search().toLowerCase();
    const from = this.dateFrom();
    const to = this.dateTo();
    return this.completedInterviews().filter(i => {
      const candidateName = `${i.candidate.firstname} ${i.candidate.lastname}`.toLowerCase();
      const positionTitle = i.position.title.toLowerCase();
      const round = String(i.round);
      const type = (i.type || '').toLowerCase();
      const status = i.status.toLowerCase();
      const matchText = !s || candidateName.includes(s) || positionTitle.includes(s) || round.includes(s) || type.includes(s) || status.includes(s);
      const matchFrom = !from || i.date >= from;
      const matchTo = !to || i.date <= to;
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

  viewFeedback(interviewId: string) {
    this.router.navigate(['/interviewer/feedback', interviewId]);
  }
}

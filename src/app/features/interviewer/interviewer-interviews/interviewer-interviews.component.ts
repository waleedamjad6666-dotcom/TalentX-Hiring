import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InterviewerService } from '../../../core/services/interviewer.service';
import { isInterviewStarted } from '../../../shared/utils';

@Component({
  selector: 'app-interviewer-interviews',
  imports: [RouterLink, DatePipe],
  templateUrl: './interviewer-interviews.component.html'
})
export class InterviewerInterviewsComponent implements OnInit {
  interviewerService = inject(InterviewerService);
  search = signal('');
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  ngOnInit() {
    this.interviewerService.fetchInterviews();
  }

  scheduledInterviews = computed(() =>
    this.interviewerService.interviews()
      .filter(i => i.status === 'scheduled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
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

  isInterviewStarted = isInterviewStarted;
}

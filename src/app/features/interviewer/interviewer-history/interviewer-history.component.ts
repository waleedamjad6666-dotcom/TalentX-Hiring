import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InterviewerService } from '../../../core/services/interviewer.service';

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
  sortColumn = signal<string>('date');
  sortDirection = signal<'asc' | 'desc'>('desc');

  ngOnInit() {
    this.interviewerService.fetchInterviews();
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

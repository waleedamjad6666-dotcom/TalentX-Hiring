import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { getInitials } from '../../../shared/utils';
import { FeedbackResponse } from '../../../core/models';

type StatusFilter = 'all' | 'today' | 'pending' | 'hired' | 'rejected' | 'hold' | 'next_round';

@Component({
  selector: 'app-admin-interviews',
  imports: [DatePipe],
  templateUrl: './admin-interviews.component.html'
})
export class AdminInterviewsComponent implements OnInit {
  adminService = inject(AdminService);
  route = inject(ActivatedRoute);

  search = signal('');
  statusFilter = signal<StatusFilter>('all');

  filterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'today', label: 'Interviews Today' },
    { value: 'pending', label: 'Pending' },
    { value: 'hired', label: 'Hired' },
    { value: 'next_round', label: 'Next Round' },
    { value: 'hold', label: 'Hold' },
    { value: 'rejected', label: 'Rejected' }
  ];

  ngOnInit() {
    this.adminService.fetchInterviews();
    const filter = this.route.snapshot.queryParamMap.get('filter');
    if (filter && this.filterOptions.some(o => o.value === filter)) {
      this.statusFilter.set(filter as StatusFilter);
    }
  }

  completedInterviews = computed(() =>
    this.adminService.interviews()
      .filter(i => i.status === 'completed')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  );

  pendingCount = computed(() => this.completedInterviews().filter(i => i.decision === 'pending').length);

  hiredCount = computed(() => this.completedInterviews().filter(i => i.decision === 'hired').length);

  filteredInterviews = computed(() => {
    const s = this.search().toLowerCase();
    const f = this.statusFilter();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return this.completedInterviews().filter(i => {
      const name = `${i.candidate.firstname} ${i.candidate.lastname}`.toLowerCase();
      const pos = i.position.title.toLowerCase();
      const code = (i.candidate.candidateCode || '').toLowerCase();
      const matchText = !s || name.includes(s) || pos.includes(s) || code.includes(s);
      const matchStatus = f === 'all' || (f === 'today' ? i.date === todayStr : i.decision === f);
      return matchText && matchStatus;
    });
  });

  updateSearch(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
  }

  setStatusFilter(f: StatusFilter) {
    this.statusFilter.set(f);
  }

  getInitials(firstname: string, lastname: string) {
    return getInitials(firstname, lastname);
  }

  interviewerName(fb: FeedbackResponse) {
    return fb.interviewer ? `${fb.interviewer.firstname} ${fb.interviewer.lastname}` : 'Interviewer';
  }

  interviewerInitials(fb: FeedbackResponse) {
    return fb.interviewer ? getInitials(fb.interviewer.firstname, fb.interviewer.lastname) : '?';
  }

  averageRating(feedbacks: FeedbackResponse[] | undefined) {
    if (!feedbacks || feedbacks.length === 0) return null;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  }

  decisionLabel(decision: string) {
    switch (decision) {
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      case 'hold': return 'Hold';
      case 'next_round': return 'Next Round';
      default: return 'Pending';
    }
  }

  decisionClasses(decision: string) {
    const base = 'px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider';
    switch (decision) {
      case 'hired': return `${base} bg-green-500/15 text-green-400 border border-green-500/30`;
      case 'rejected': return `${base} bg-red-500/15 text-red-400 border border-red-500/30`;
      case 'hold': return `${base} bg-yellow-500/15 text-yellow-400 border border-yellow-500/30`;
      case 'next_round': return `${base} bg-blue-500/15 text-blue-400 border border-blue-500/30`;
      default: return `${base} bg-neutral-500/15 text-neutral-400 border border-neutral-600`;
    }
  }

  recommendationLabel(r: string) {
    return r === 'Yes' ? 'Recommend for Hire' : r === 'No' ? 'Do Not Recommend' : 'Hold for Review';
  }
}

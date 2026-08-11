import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { RouterLink } from '@angular/router';
import { getInitialsFromName } from '../../../shared/utils';
import { ApiInterview, FeedbackResponse } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  adminService = inject(AdminService);

  decidingId = signal<string | null>(null);
  decisionMsg = signal('');

  upcomingInterviews = computed(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return this.adminService.interviews()
      .filter(i => i.status === 'scheduled' && new Date(i.startTime).getTime() >= todayStart)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  interviewsTodayCount = computed(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return this.adminService.interviews()
      .filter(i => i.date === todayStr && (i.status === 'scheduled' || i.status === 'in-progress'))
      .length;
  });

  pendingFeedbackCount = computed(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return this.adminService.interviews()
      .filter(i => i.status === 'scheduled' && i.date === todayStr)
      .length;
  });

  hiredCount = computed(() =>
    this.adminService.interviews().filter(i => i.status === 'completed' && i.decision === 'hired').length
  );

  rejectedCount = computed(() =>
    this.adminService.interviews().filter(i => i.status === 'completed' && i.decision === 'rejected').length
  );

  pendingDecisions = computed(() =>
    this.adminService.interviews()
      .filter(i => i.status === 'completed' && i.decision === 'pending')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  );

  ngOnInit() {
    this.adminService.fetchInterviews();
    this.adminService.fetchCandidates();
  }

  makeDecision(interview: ApiInterview, decision: 'hired' | 'rejected' | 'hold' | 'next_round') {
    if (this.decidingId()) return;
    this.decidingId.set(interview.id);
    this.decisionMsg.set('');

    this.adminService.updateInterviewDecision(interview.id, decision).subscribe({
      next: () => {
        this.decidingId.set(null);
        this.decisionMsg.set(`${interview.candidate.firstname} ${interview.candidate.lastname} marked as ${this.decisionLabel(decision)}.`);
        setTimeout(() => this.decisionMsg.set(''), 4000);
      },
      error: (err) => {
        this.decidingId.set(null);
        this.decisionMsg.set(err.error?.message || 'Failed to update decision.');
      }
    });
  }

  decisionLabel(decision: string) {
    switch (decision) {
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      case 'hold': return 'On Hold';
      default: return 'Advanced to Next Round';
    }
  }

  avgRating(feedbacks: FeedbackResponse[] | undefined) {
    if (!feedbacks || feedbacks.length === 0) return null;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  }

  getCandidateName(interview: ApiInterview) {
    return interview?.candidate ? `${interview.candidate.firstname} ${interview.candidate.lastname}` : 'Unknown';
  }
  getCandidateRole(interview: ApiInterview) {
    return interview?.candidate?.currentPosition || interview?.position?.title || 'Role';
  }
  getMonth(dateStr: string) {
    return new Date(dateStr).toLocaleString('default', { month: 'short' });
  }
  getDay(dateStr: string) {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }
  getTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  getInitials(name: string) {
    return getInitialsFromName(name);
  }
}

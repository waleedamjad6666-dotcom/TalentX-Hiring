import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { RouterLink } from '@angular/router';
import { getInitialsFromName } from '../../../shared/utils';
import { ApiInterview, ApiInterviewRound, FeedbackResponse } from '../../../core/models';
import { InterviewModalComponent } from '../interview-modal/interview-modal.component';
import { DeleteInterviewDialogComponent } from '../delete-interview-dialog/delete-interview-dialog.component';

export interface PendingDecision {
  id: string;
  type: 'interview' | 'round';
  interview: ApiInterview;
  round?: ApiInterviewRound;
  feedbacks: FeedbackResponse[];
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe, InterviewModalComponent, DeleteInterviewDialogComponent],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  adminService = inject(AdminService);

  decidingId = signal<string | null>(null);
  decisionMsg = signal('');
  resumingId = signal<string | null>(null);

  editingInterview = signal<ApiInterview | null>(null);
  deletingInterview = signal<ApiInterview | null>(null);

  openEditInterview(interview: ApiInterview) {
    this.editingInterview.set(interview);
  }

  closeEditInterview() {
    this.editingInterview.set(null);
  }

  onInterviewSaved() {
    this.editingInterview.set(null);
    this.adminService.fetchInterviews();
  }

  openDeleteInterview(interview: ApiInterview) {
    this.deletingInterview.set(interview);
  }

  closeDeleteInterview() {
    this.deletingInterview.set(null);
  }

  onInterviewDeleted() {
    this.deletingInterview.set(null);
    this.adminService.fetchInterviews();
  }

  schedulingRoundId = signal<string | null>(null);
  schedulingDate = signal('');
  schedulingTime = signal('');
  actingRoundId = signal<string | null>(null);
  roundMsg = signal('');
  selectedRoundFeedback = signal<{ interviewId: string; roundId: string } | null>(null);
  activeModalFeedback = signal<{ interview: ApiInterview; round: ApiInterviewRound } | null>(null);

  get todayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  openFeedbackModal(interview: ApiInterview, round: ApiInterviewRound) {
    this.activeModalFeedback.set({ interview, round });
  }

  closeFeedbackModal() {
    this.activeModalFeedback.set(null);
  }

  interviewerName(fb: FeedbackResponse) {
    return fb.interviewer ? `${fb.interviewer.firstname} ${fb.interviewer.lastname}` : 'Interviewer';
  }

  interviewerInitials(fb: FeedbackResponse) {
    return fb.interviewer ? getInitialsFromName(`${fb.interviewer.firstname} ${fb.interviewer.lastname}`) : '?';
  }

  recommendationLabel(r: string) {
    return r === 'Yes' ? 'Recommend for Hire' : r === 'No' ? 'Do Not Recommend' : 'Hold for Review';
  }

  toggleRoundFeedback(interviewId: string, roundId: string) {
    const current = this.selectedRoundFeedback();
    if (current && current.interviewId === interviewId && current.roundId === roundId) {
      this.selectedRoundFeedback.set(null);
    } else {
      this.selectedRoundFeedback.set({ interviewId, roundId });
    }
  }

  getRoundFeedbacks(interview: ApiInterview, roundId: string) {
    return (interview.interviewFeedbacks || []).filter(f => f.roundId === roundId);
  }

  upcomingInterviews = computed(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return this.adminService.interviews()
      .filter(i => {
        if (i.status === 'pending_schedule') return true;
        return i.status === 'scheduled' && new Date(i.startTime).getTime() >= todayStart;
      })
      .sort((a, b) => {
        const aIsPending = !a.startTime || a.status === 'pending_schedule';
        const bIsPending = !b.startTime || b.status === 'pending_schedule';
        if (aIsPending && !bIsPending) return 1;
        if (!aIsPending && bIsPending) return -1;
        if (aIsPending && bIsPending) return 0;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
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

  pendingDecisions = computed<PendingDecision[]>(() => {
    const list: PendingDecision[] = [];
    for (const interview of this.adminService.interviews()) {
      if (interview.rounds && interview.rounds.length > 0) {
        for (const round of interview.rounds) {
          if (round.status === 'completed' && (!round.decision || round.decision === 'pending')) {
            const feedbacks = (interview.interviewFeedbacks || []).filter(
              (f) => f.roundId === round.id
            );
            list.push({
              id: `${interview.id}-round-${round.id}`,
              type: 'round',
              interview,
              round,
              feedbacks
            });
          }
        }
      } else {
        if (interview.status === 'completed' && interview.decision === 'pending') {
          list.push({
            id: interview.id,
            type: 'interview',
            interview,
            feedbacks: interview.interviewFeedbacks || []
          });
        }
      }
    }
    return list.sort((a, b) => new Date(b.interview.startTime).getTime() - new Date(a.interview.startTime).getTime());
  });

  heldDecisions = computed<PendingDecision[]>(() => {
    const list: PendingDecision[] = [];
    for (const interview of this.adminService.interviews()) {
      if (interview.decision === 'hold') {
        const heldRound = interview.rounds?.find(r => r.decision === 'hold');
        const feedbacks = heldRound
          ? (interview.interviewFeedbacks || []).filter(f => f.roundId === heldRound.id)
          : interview.interviewFeedbacks || [];
        list.push({
          id: `${interview.id}-held`,
          type: heldRound ? 'round' : 'interview',
          interview,
          round: heldRound,
          feedbacks
        });
      }
    }
    return list.sort((a, b) => new Date(b.interview.startTime).getTime() - new Date(a.interview.startTime).getTime());
  });

  ngOnInit() {
    this.adminService.fetchInterviews();
    this.adminService.fetchCandidates();
  }

  makeDecision(item: PendingDecision, decision: 'hired' | 'rejected' | 'hold' | 'next_round') {
    if (this.decidingId()) return;
    this.decidingId.set(item.id);
    this.decisionMsg.set('');

    const obs = item.type === 'round'
      ? this.adminService.updateRoundDecision(item.interview.id, item.round!.id, decision)
      : this.adminService.updateInterviewDecision(item.interview.id, decision);

    obs.subscribe({
      next: () => {
        this.decidingId.set(null);
        this.decisionMsg.set(`${item.interview.candidate.firstname} ${item.interview.candidate.lastname} marked as ${this.decisionLabel(decision)}.`);
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

  resumeDecision(item: PendingDecision) {
    if (this.resumingId() || this.decidingId()) return;
    this.resumingId.set(item.id);
    this.decisionMsg.set('');

    this.adminService.resumeInterview(item.interview.id).subscribe({
      next: () => {
        this.resumingId.set(null);
        this.decisionMsg.set(`${item.interview.candidate.firstname} ${item.interview.candidate.lastname} interview resumed.`);
        setTimeout(() => this.decisionMsg.set(''), 4000);
      },
      error: (err) => {
        this.resumingId.set(null);
        this.decisionMsg.set(err.error?.message || 'Failed to resume interview.');
        setTimeout(() => this.decisionMsg.set(''), 4000);
      }
    });
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

  beginScheduleRound(round: ApiInterviewRound) {
    this.schedulingRoundId.set(round.id);
    this.schedulingDate.set('');
    this.schedulingTime.set('');
    this.roundMsg.set('');
  }

  clearScheduleRound() {
    this.schedulingRoundId.set(null);
    this.schedulingDate.set('');
    this.schedulingTime.set('');
  }

  updateScheduleDate(e: Event) {
    this.schedulingDate.set((e.target as HTMLInputElement).value);
  }

  updateScheduleTime(e: Event) {
    this.schedulingTime.set((e.target as HTMLInputElement).value);
  }

  getSchedulingRound(interview: ApiInterview): ApiInterviewRound | undefined {
    return interview.rounds?.find(r => r.id === this.schedulingRoundId());
  }

  actionableRounds(interview: ApiInterview): ApiInterviewRound[] {
    return (interview.rounds || []).filter(r => r.status === 'pending' || r.status === 'scheduled');
  }

  saveRoundSchedule(interview: ApiInterview) {
    const round = this.getSchedulingRound(interview);
    if (!round) return;
    if (!this.schedulingDate() || !this.schedulingTime()) {
      this.roundMsg.set('Please provide both a date and a time.');
      return;
    }
    // Validate date/time is not in the past
    const now = new Date();
    const selectedDateTime = new Date(`${this.schedulingDate()}T${this.schedulingTime()}`);
    if (selectedDateTime < now) {
      this.roundMsg.set('Cannot schedule a round in the past. Please select a future date and time.');
      return;
    }
    this.actingRoundId.set(round.id);
    const startTime = new Date(`${this.schedulingDate()}T${this.schedulingTime()}`);
    const endTime = new Date(startTime.getTime() + round.duration * 60000);
    this.adminService.updateRoundSchedule(interview.id, round.id, {
      date: this.schedulingDate(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    }).subscribe({
      next: () => {
        this.actingRoundId.set(null);
        this.clearScheduleRound();
        this.roundMsg.set(`Round ${round.roundNumber} scheduled.`);
        this.adminService.fetchInterviews();
        setTimeout(() => this.roundMsg.set(''), 4000);
      },
      error: (err) => {
        this.actingRoundId.set(null);
        this.roundMsg.set(err.error?.message || 'Failed to schedule round.');
      }
    });
  }

  cancelRoundAction(interview: ApiInterview, round: ApiInterviewRound) {
    this.actingRoundId.set(round.id);
    this.adminService.cancelRound(interview.id, round.id).subscribe({
      next: () => {
        this.actingRoundId.set(null);
        this.roundMsg.set(`Round ${round.roundNumber} cancelled.`);
        this.adminService.fetchInterviews();
        setTimeout(() => this.roundMsg.set(''), 4000);
      },
      error: (err) => {
        this.actingRoundId.set(null);
        this.roundMsg.set(err.error?.message || 'Failed to cancel round.');
      }
    });
  }

  roundStatusClasses(status: string) {
    const base = 'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider';
    switch (status) {
      case 'scheduled': return `${base} bg-blue-500/15 text-blue-400 border border-blue-500/30`;
      case 'in-progress': return `${base} bg-amber-500/15 text-amber-400 border border-amber-500/30`;
      case 'completed': return `${base} bg-green-500/15 text-green-400 border border-green-500/30`;
      case 'cancelled': return `${base} bg-red-500/15 text-red-400 border border-red-500/30`;
      case 'pending':
      case 'pending_schedule': return `${base} bg-amber-500/15 text-amber-400 border border-amber-500/30`;
      default: return `${base} bg-neutral-500/15 text-neutral-400 border border-neutral-600`;
    }
  }

  roundDateTime(round: ApiInterviewRound) {
    if (!round.date) return 'Not scheduled';
    if (!round.startTime) return round.date;
    return `${round.date} at ${new Date(round.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }

  getRoundInterviewer(round: ApiInterviewRound) {
    if (!round.interviewers || round.interviewers.length === 0) return 'No interviewer';
    return round.interviewers.map(i => `${i.firstname} ${i.lastname}`).join(', ');
  }

  canHire(item: PendingDecision): boolean {
    if (item.type === 'interview') return true;
    if (!item.round || !item.interview.rounds) return true;
    const remaining = item.interview.rounds.filter(
      r => r.roundNumber > item.round!.roundNumber && r.status !== 'cancelled'
    );
    return remaining.length === 0;
  }

  canNextRound(item: PendingDecision): boolean {
    if (item.type === 'interview') return false;
    if (!item.interview.rounds) return false;
    const validRounds = item.interview.rounds.filter(
      r => r.status !== 'cancelled'
    );
    return validRounds.length > 1;
  }
}


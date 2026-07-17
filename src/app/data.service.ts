import { Injectable, signal, computed } from '@angular/core';
import { candidatesData, interviewsData } from './data';
import { Candidate, Interview } from './models';

@Injectable({ providedIn: 'root' })
export class DataService {
  candidates = signal<Candidate[]>(candidatesData);
  interviews = signal<Interview[]>(interviewsData);

  uniqueInterviewers = computed(() => {
    const names = this.interviews().map(i => i.interviewerName);
    return [...new Set(names)].filter(Boolean).sort();
  });

  upcomingInterviews = computed(() => {
    return this.interviews().filter(i => i.status === 'Scheduled').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  interviewsTodayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.interviews().filter(i => i.date === today).length;
  });

  pendingFeedbackCount = computed(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return this.interviews().filter(i => {
      if (i.status !== 'Scheduled') return false;
      const idate = new Date(i.date);
      return idate <= today;
    }).length;
  });

  totalPipelineCount = computed(() => {
    return this.candidates().length;
  });

  scheduleInterview(interview: Interview) {
    this.interviews.update(ints => [...ints, interview]);
  }

  addCandidate(candidate: Candidate) {
    this.candidates.update(cands => [candidate, ...cands]);
  }

  submitFeedback(id: string, feedback: any) {
    this.interviews.update(ints => ints.map(i => {
      if (i.id === id) {
        return { ...i, status: 'Completed', feedback, hiringUpdate: undefined };
      }
      return i;
    }));
  }

  pendingDecisions = computed(() => {
    return this.interviews().filter(i => i.status === 'Completed' && !i.hiringUpdate);
  });

  updateHiringDecision(interviewId: string, decision: string) {
    let candId = 0;
    this.interviews.update(ints => ints.map(i => {
      if (i.id === interviewId) {
        candId = i.candidateId;
        return { ...i, hiringUpdate: decision };
      }
      return i;
    }));
    
    if (candId) {
      let candStatus = 'Interviewing';
      if (decision === 'Offer Sent') candStatus = 'Offer Sent';
      else if (decision === 'Rejected') candStatus = 'Rejected';
      else if (decision === 'Hold' || decision === 'Proceed to Next Round') candStatus = 'Screening';
      
      this.candidates.update(cands => cands.map(c => {
        if (c.id === candId) {
          return { ...c, status: candStatus };
        }
        return c;
      }));
    }
  }
}

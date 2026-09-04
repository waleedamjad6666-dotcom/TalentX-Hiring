import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InterviewerService } from '../../../core/services/interviewer.service';
import { getInitials } from '../../../shared/utils';

@Component({
  selector: 'app-candidate-details',
  templateUrl: './candidate-details.component.html'
})
export class CandidateDetailsComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  interviewerService = inject(InterviewerService);

  candidateId: string | null = null;
  private paramSub!: Subscription;

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      this.candidateId = params.get('id');
      if (this.candidateId) {
        this.interviewerService.fetchCandidate(this.candidateId);
      }
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
    this.interviewerService.clearCandidate();
  }

  getInitials(firstname: string | undefined, lastname: string | undefined) {
    return getInitials(firstname, lastname);
  }

  downloadResume() {
    const c = this.interviewerService.candidate();
    if (!c || !c.resumeUrl) return;

    this.interviewerService.downloadResume(c.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${c.firstname}_${c.lastname}_resume.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {}
    });
  }
}

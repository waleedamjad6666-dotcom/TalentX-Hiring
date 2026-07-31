import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InterviewerService } from '../../interviewer.service';

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
    if (!firstname && !lastname) return '';
    const first = firstname?.[0] || '';
    const last = lastname?.[0] || '';
    return (first + last).toUpperCase();
  }
}

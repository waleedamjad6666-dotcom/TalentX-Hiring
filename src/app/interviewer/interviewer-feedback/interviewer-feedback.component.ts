import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../data.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-interviewer-feedback',
  imports: [ReactiveFormsModule],
  templateUrl: './interviewer-feedback.component.html'
})
export class InterviewerFeedbackComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);

  interviewId = this.route.snapshot.paramMap.get('id');
  
  interview = computed(() => this.dataService.interviews().find(i => i.id === this.interviewId));
  candidate = computed(() => {
    const inv = this.interview();
    return inv ? this.dataService.candidates().find(c => c.id === inv.candidateId) : null;
  });

  rating = signal(0);

  form = new FormGroup({
    recommended: new FormControl('', {nonNullable: true}),
    positive: new FormControl('', {nonNullable: true}),
    negative: new FormControl('', {nonNullable: true}),
    additional: new FormControl('', {nonNullable: true})
  });

  getInitials(name: string | undefined) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }

  submit() {
    const v = this.form.value;
    this.dataService.submitFeedback(this.interviewId!, {
      rating: this.rating(),
      recommended: v.recommended as 'Yes' | 'No' | 'Hold',
      positive: v.positive!,
      negative: v.negative!,
      additional: v.additional!
    });
    this.router.navigate(['/interviewer/dashboard']);
  }
}

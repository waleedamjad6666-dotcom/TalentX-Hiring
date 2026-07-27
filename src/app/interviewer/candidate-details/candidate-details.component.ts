import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-candidate-details',
  templateUrl: './candidate-details.component.html'
})
export class CandidateDetailsComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);

  interviewId = this.route.snapshot.paramMap.get('id');
  
  interview = computed(() => this.dataService.interviews().find(i => i.id === this.interviewId));
  candidate = computed(() => {
    const inv = this.interview();
    return inv ? this.dataService.candidates().find(c => c.id === inv.candidateId) : null;
  });

  getInitials(name: string | undefined) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }
}

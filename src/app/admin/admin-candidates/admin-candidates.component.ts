import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { CandidateModalComponent } from './candidate-modal/candidate-modal.component';

@Component({
  selector: 'app-admin-candidates',
  imports: [CandidateModalComponent],
  templateUrl: './admin-candidates.component.html'
})
export class AdminCandidatesComponent implements OnInit {
  adminService = inject(AdminService);

  showModal = signal(false);
  search = signal('');

  filteredCandidates = computed(() => {
    const s = this.search().toLowerCase();
    return this.adminService.candidates().filter(c => {
      const fullName = `${c.firstname} ${c.lastname}`.toLowerCase();
      const position = (c.currentPosition || '').toLowerCase();
      const email = c.email.toLowerCase();
      const skills = c.skills?.join(' ').toLowerCase() || '';
      return fullName.includes(s) || position.includes(s) || email.includes(s) || skills.includes(s);
    });
  });

  ngOnInit() {
    this.adminService.fetchCandidates();
  }

  updateSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }

  refreshCandidates() {
    this.adminService.fetchCandidates();
  }

  onCandidateCreated() {
    this.showModal.set(false);
    this.refreshCandidates();
  }

  getFullName(c: { firstname: string; lastname: string }) {
    return `${c.firstname} ${c.lastname}`;
  }

  getInitials(firstname: string, lastname: string) {
    return `${firstname[0]}${lastname[0]}`.toUpperCase();
  }
}

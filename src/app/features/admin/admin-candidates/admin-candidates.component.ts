import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ApiCandidate } from '../../../core/models';
import { CandidateModalComponent } from './candidate-modal/candidate-modal.component';
import { DeleteCandidateDialogComponent } from './delete-candidate-dialog/delete-candidate-dialog.component';
import { getInitials } from '../../../shared/utils';

@Component({
  selector: 'app-admin-candidates',
  imports: [CandidateModalComponent, DeleteCandidateDialogComponent],
  templateUrl: './admin-candidates.component.html'
})
export class AdminCandidatesComponent implements OnInit {
  adminService = inject(AdminService);
  private router = inject(Router);

  showModal = signal(false);
  search = signal('');
  activeDropdown = signal<string | null>(null);

  selectedCandidate = signal<ApiCandidate | null>(null);
  deletingCandidate = signal<ApiCandidate | null>(null);

  filteredCandidates = computed(() => {
    const s = this.search().toLowerCase();
    return this.adminService.candidates().filter(c => {
      const fullName = `${c.firstname} ${c.lastname}`.toLowerCase();
      const position = (c.currentPosition || '').toLowerCase();
      const email = c.email.toLowerCase();
      const company = (c.currentCompany || '').toLowerCase();
      const experience = (c.experience || '').toLowerCase();
      const skills = c.skills?.join(' ').toLowerCase() || '';
      return fullName.includes(s) || position.includes(s) || email.includes(s) || company.includes(s) || experience.includes(s) || skills.includes(s);
    });
  });

  ngOnInit() {
    this.adminService.fetchCandidates();
  }

  updateSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }

  refreshCandidates() {
    this.adminService.fetchCandidates();
  }

  openCreate() {
    this.selectedCandidate.set(null);
    this.showModal.set(true);
  }

  onCandidateSaved() {
    this.showModal.set(false);
    this.selectedCandidate.set(null);
    this.refreshCandidates();
  }

  getFullName(c: { firstname: string; lastname: string }) {
    return `${c.firstname} ${c.lastname}`;
  }

  getInitials(firstname: string, lastname: string) {
    return getInitials(firstname, lastname);
  }

  viewDetails(candidate: ApiCandidate) {
    this.router.navigate(['/admin/candidates', candidate.id]);
  }

  toggleDropdown(candidateId: string, event: Event) {
    event.stopPropagation();
    if (this.activeDropdown() === candidateId) {
      this.activeDropdown.set(null);
    } else {
      this.activeDropdown.set(candidateId);
    }
  }

  closeDropdown() {
    this.activeDropdown.set(null);
  }

  openEdit(candidate: ApiCandidate, event: Event) {
    event.stopPropagation();
    this.activeDropdown.set(null);
    this.selectedCandidate.set(candidate);
    this.showModal.set(true);
  }

  openDelete(candidate: ApiCandidate, event: Event) {
    event.stopPropagation();
    this.activeDropdown.set(null);
    this.deletingCandidate.set(candidate);
  }

  onCandidateDeleted() {
    this.deletingCandidate.set(null);
    this.refreshCandidates();
  }
}

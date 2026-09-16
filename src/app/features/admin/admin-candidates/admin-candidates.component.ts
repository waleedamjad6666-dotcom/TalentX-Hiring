import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ApiCandidate } from '../../../core/models';
import { CandidateModalComponent } from './candidate-modal/candidate-modal.component';
import { DeleteCandidateDialogComponent } from './delete-candidate-dialog/delete-candidate-dialog.component';
import { AiResumeMatcherModalComponent } from './ai-resume-matcher-modal/ai-resume-matcher-modal.component';
import { getInitials } from '../../../shared/utils';

@Component({
  selector: 'app-admin-candidates',
  imports: [CandidateModalComponent, DeleteCandidateDialogComponent, AiResumeMatcherModalComponent],
  templateUrl: './admin-candidates.component.html'
})
export class AdminCandidatesComponent implements OnInit {
  adminService = inject(AdminService);
  private router = inject(Router);

  showModal = signal(false);
  showMatcherModal = signal(false);
  search = signal('');
  statusFilter = signal<'all' | 'shortlisted' | 'neglected'>('all');

  activeDropdown = signal<string | null>(null);

  selectedCandidate = signal<ApiCandidate | null>(null);
  deletingCandidate = signal<ApiCandidate | null>(null);

  totalCount = computed(() => this.adminService.candidates().length);
  
  shortlistedCount = computed(() =>
    this.adminService.candidates().filter(c => (c.status || 'shortlisted').toLowerCase() === 'shortlisted').length
  );

  neglectedCount = computed(() =>
    this.adminService.candidates().filter(c => (c.status || '').toLowerCase() === 'neglected' || c.aiTier === 'NEGLECTED').length
  );

  filteredCandidates = computed(() => {
    const s = this.search().toLowerCase().trim();
    const filter = this.statusFilter();

    return this.adminService.candidates().filter(c => {
      // Status filter
      const candidateStatus = (c.status || 'shortlisted').toLowerCase();
      const isNeglected = candidateStatus === 'neglected' || c.aiTier === 'NEGLECTED';
      
      if (filter === 'neglected' && !isNeglected) {
        return false;
      }
      if (filter === 'shortlisted' && isNeglected) {
        return false;
      }

      // Search filter
      if (!s) return true;

      const fullName = `${c.firstname} ${c.lastname}`.toLowerCase();
      const position = (c.currentPosition || '').toLowerCase();
      const email = c.email.toLowerCase();
      const company = (c.currentCompany || '').toLowerCase();
      const experience = (c.experience || '').toLowerCase();
      const skills = c.skills?.join(' ').toLowerCase() || '';
      const candidateCode = (c.candidateCode || '').toLowerCase();
      const aiTarget = (c.aiTargetPosition?.title || '').toLowerCase();
      const aiSummary = (c.aiSummary || '').toLowerCase();

      return fullName.includes(s) ||
        position.includes(s) ||
        email.includes(s) ||
        company.includes(s) ||
        experience.includes(s) ||
        skills.includes(s) ||
        candidateCode.includes(s) ||
        aiTarget.includes(s) ||
        aiSummary.includes(s);
    });
  });

  setStatusFilter(filter: 'all' | 'shortlisted' | 'neglected') {
    this.statusFilter.set(filter);
  }

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

  navigateToVacancy(positionId: string | null | undefined, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (!positionId) {
      this.router.navigate(['/admin/vacancies']);
      return;
    }
    this.router.navigate(['/admin/vacancies'], {
      queryParams: { highlight: positionId }
    });
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

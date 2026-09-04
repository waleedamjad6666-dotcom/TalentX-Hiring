import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ApiVacancy, ApiInterview } from '../../../core/models';
import { AiResumeMatcherModalComponent } from '../admin-candidates/ai-resume-matcher-modal/ai-resume-matcher-modal.component';
import { getInitials } from '../../../shared/utils';

type StatusFilter = 'all' | 'open' | 'closed';
type StatKey = 'all' | 'open' | 'applied' | 'interviewing' | 'hired' | 'noHire';

@Component({
  selector: 'app-admin-vacancies',
  imports: [ReactiveFormsModule, AiResumeMatcherModalComponent],
  templateUrl: './admin-vacancies.component.html'
})
export class AdminVacanciesComponent implements OnInit {
  adminService = inject(AdminService);

  search = signal('');
  statusFilter = signal<StatusFilter>('all');
  activeStat = signal<StatKey>('all');
  expandedId = signal<string | null>(null);

  showCreateModal = signal(false);
  showManageModal = signal(false);
  showMatcherModal = signal(false);
  matcherPositionId = signal<string | null>(null);
  manageTarget = signal<ApiVacancy | null>(null);
  submitting = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  filterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' }
  ];

  createForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    departmentId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    requiredSkills: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    minimumExperience: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    maximumExperience: new FormControl<number | null>(null),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl('open', { nonNullable: true }),
    openings: new FormControl<number | null>(1, { validators: [Validators.required, Validators.min(1)] })
  });

  manageForm = new FormGroup({
    status: new FormControl('open', { nonNullable: true }),
    openings: new FormControl<number | null>(1, { validators: [Validators.min(1)] }),
    closeReason: new FormControl('', { nonNullable: true })
  });

  ngOnInit() {
    this.adminService.loadVacancies();
    this.adminService.loadDepartments();
    this.adminService.fetchInterviews();
  }

  getInterviews() {
    return this.adminService.interviews();
  }

  interviewsForVacancy(v: ApiVacancy): ApiInterview[] {
    return this.getInterviews().filter(i => i.positionId === v.id);
  }

  candidatesByDecision(v: ApiVacancy): { decision: string; interviews: ApiInterview[] }[] {
    const list = this.interviewsForVacancy(v);
    return [
      { decision: 'hired', interviews: list.filter(i => i.decision === 'hired') },
      { decision: 'interviewing', interviews: list.filter(i => ['scheduled', 'in-progress', 'pending'].includes(i.status)) },
      { decision: 'hold', interviews: list.filter(i => i.decision === 'hold') },
      { decision: 'rejected', interviews: list.filter(i => i.decision === 'rejected') }
    ].filter(g => g.interviews.length > 0);
  }

  statusFilterFromStat(key: StatKey) {
    this.activeStat.set(key);
    this.setStatusFilter(key === 'open' ? 'open' : key === 'noHire' ? 'closed' : 'all');
  }

  isStatActive(key: StatKey) {
    return this.activeStat() === key;
  }

  openVacancies = computed(() => this.vacancies().filter(v => v.status === 'open'));
  closedVacancies = computed(() => this.vacancies().filter(v => v.status === 'closed'));

  closedWithoutHire = computed(() =>
    this.closedVacancies().filter(v => (v.stats?.hired ?? 0) === 0)
  );

  totalOpenings = computed(() =>
    this.openVacancies().reduce((sum, v) => sum + (v.openings || 0), 0)
  );

  totalApplied = computed(() =>
    this.vacancies().reduce((sum, v) => sum + (v.stats?.applied ?? 0), 0)
  );

  totalHired = computed(() =>
    this.vacancies().reduce((sum, v) => sum + (v.stats?.hired ?? 0), 0)
  );

  totalInterviewing = computed(() =>
    this.vacancies().reduce((sum, v) => sum + (v.stats?.interviewing ?? 0), 0)
  );

  filteredVacancies = computed(() => {
    const s = this.search().toLowerCase();
    const f = this.statusFilter();
    return this.vacancies().filter(v => {
      const title = v.title.toLowerCase();
      const dept = (v.department?.name || '').toLowerCase();
      const coded = `${v.title} ${v.department?.name || ''}`.toLowerCase();
      const matchText = !s || coded.includes(s);
      const matchStatus = f === 'all' || v.status === f;
      return matchText && matchStatus;
    });
  });

  vacancies() {
    return this.adminService.vacancies();
  }

  updateSearch(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
  }

  setStatusFilter(f: StatusFilter) {
    this.statusFilter.set(f);
  }

  creatorName(v: ApiVacancy): string {
    if (v.creator) return `${v.creator.firstname} ${v.creator.lastname}`;
    return 'Admin';
  }

  toggleExpand(v: ApiVacancy) {
    if (this.expandedId() === v.id) {
      this.expandedId.set(null);
    } else {
      this.expandedId.set(v.id);
    }
  }

  isExpanded(v: ApiVacancy) {
    return this.expandedId() === v.id;
  }

  candidateName(i: ApiInterview): string {
    return i.candidate ? `${i.candidate.firstname} ${i.candidate.lastname}` : 'Candidate';
  }

  candidateInitials(i: ApiInterview): string {
    if (i.candidate) return getInitials(i.candidate.firstname, i.candidate.lastname);
    return '?';
  }

  decisionGroupLabel(decision: string): string {
    switch (decision) {
      case 'hired': return 'Hired';
      case 'interviewing': return 'Interviewing';
      case 'hold': return 'On Hold';
      case 'rejected': return 'Rejected';
      default: return 'Applied';
    }
  }

  openCreate() {
    this.errorMsg.set('');
    this.showCreateModal.set(true);
  }

  closeCreate() {
    this.showCreateModal.set(false);
    this.createForm.reset();
    this.createForm.patchValue({ status: 'open', openings: 1 });
  }

  openManage(v: ApiVacancy) {
    this.manageTarget.set(v);
    this.manageForm.reset();
    this.manageForm.patchValue({ status: v.status, openings: v.openings || 1, closeReason: v.closeReason || '' });
    this.errorMsg.set('');
    this.successMsg.set('');
    this.showManageModal.set(true);
  }

  closeManage() {
    this.showManageModal.set(false);
    this.manageTarget.set(null);
  }

  createVacancy() {
    if (this.createForm.invalid) return;
    this.submitting.set(true);
    this.errorMsg.set('');

    const v = this.createForm.getRawValue();
    const skills = v.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);

    this.adminService.createPosition({
      title: v.title,
      departmentId: v.departmentId,
      requiredSkills: skills,
      minimumExperience: Number(v.minimumExperience),
      maximumExperience: v.maximumExperience !== null ? Number(v.maximumExperience) : undefined,
      description: v.description,
      status: v.status,
      openings: Number(v.openings)
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showCreateModal.set(false);
        this.createForm.reset();
        this.createForm.patchValue({ status: 'open', openings: 1 });
        this.successMsg.set(`Vacancy "${v.title}" created successfully!`);
        setTimeout(() => this.successMsg.set(''), 4000);
        this.adminService.loadVacancies();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to create vacancy');
      }
    });
  }

  saveManage() {
    const target = this.manageTarget();
    if (!target) return;
    this.submitting.set(true);
    this.errorMsg.set('');

    const m = this.manageForm.getRawValue();
    this.adminService.updatePosition(target.id, {
      status: m.status,
      openings: m.openings !== null ? Number(m.openings) : undefined,
      closeReason: m.status === 'closed' ? m.closeReason : undefined
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        const success = m.status === 'open' ? 'opened' : 'closed';
        this.successMsg.set(`Vacancy "${target.title}" ${success} successfully!`);
        this.showManageModal.set(false);
        this.manageTarget.set(null);
        setTimeout(() => this.successMsg.set(''), 4000);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to update vacancy');
      }
    });
  }

  statusBadge(status: string) {
    const base = 'px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider';
    return status === 'open'
      ? `${base} bg-green-500/15 text-green-400 border border-green-500/30`
      : `${base} bg-red-500/15 text-red-400 border border-red-500/30`;
  }

  filledPercent(v: ApiVacancy): number {
    const openings = v.openings || 1;
    const hired = v.stats?.hired ?? 0;
    return Math.min(100, Math.round((hired / openings) * 100));
  }

  openMatcherForPosition(positionId: string, e?: MouseEvent) {
    if (e) e.stopPropagation();
    this.matcherPositionId.set(positionId);
    this.showMatcherModal.set(true);
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}


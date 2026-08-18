import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { ApiCandidateDetail, ApiInterview } from '../../../core/models';
import { getInitials, formatDate } from '../../../shared/utils';
import { InterviewModalComponent } from '../interview-modal/interview-modal.component';
import { DeleteInterviewDialogComponent } from '../delete-interview-dialog/delete-interview-dialog.component';

@Component({
  selector: 'app-admin-candidate-details',
  imports: [InterviewModalComponent, DeleteInterviewDialogComponent],
  templateUrl: './admin-candidate-details.component.html'
})
export class AdminCandidateDetailsComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  adminService = inject(AdminService);

  candidate = signal<ApiCandidateDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  private paramSub!: Subscription;

  editingInterview = signal<ApiInterview | null>(null);
  deletingInterview = signal<ApiInterview | null>(null);

  openEditInterview(interview: any) {
    this.editingInterview.set(interview as ApiInterview);
  }

  closeEditInterview() {
    this.editingInterview.set(null);
  }

  onInterviewSaved() {
    this.editingInterview.set(null);
    const c = this.candidate();
    if (c) this.loadCandidate(c.id);
  }

  openDeleteInterview(interview: any) {
    this.deletingInterview.set(interview as ApiInterview);
  }

  closeDeleteInterview() {
    this.deletingInterview.set(null);
  }

  onInterviewDeleted() {
    this.deletingInterview.set(null);
    const c = this.candidate();
    if (c) this.loadCandidate(c.id);
  }

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCandidate(id);
      }
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  loadCandidate(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.fetchCandidate(id).subscribe({
      next: (res) => {
        this.candidate.set(res.candidate);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load candidate');
        this.loading.set(false);
      }
    });
  }

  getInitials(firstname: string | undefined, lastname: string | undefined) {
    return getInitials(firstname, lastname);
  }

  formatDate(date: string) {
    return formatDate(date);
  }

  goBack() {
    this.router.navigate(['/admin/candidates']);
  }

  downloadResume() {
    const c = this.candidate();
    if (!c) return;

    this.adminService.downloadResume(c.id).subscribe({
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

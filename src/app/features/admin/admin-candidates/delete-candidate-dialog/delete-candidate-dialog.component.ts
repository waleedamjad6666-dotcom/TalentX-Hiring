import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-delete-candidate-dialog',
  templateUrl: './delete-candidate-dialog.component.html'
})
export class DeleteCandidateDialogComponent {
  private adminService = inject(AdminService);

  @Input() candidateId = '';
  @Input() candidateName = '';
  @Output() closed = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  isDeleting = signal(false);
  errorMessage = signal<string | null>(null);

  close() {
    this.closed.emit();
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close();
  }

  confirmDelete() {
    this.errorMessage.set(null);
    this.isDeleting.set(true);
    this.adminService.deleteCandidate(this.candidateId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleted.emit();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete candidate');
      }
    });
  }
}

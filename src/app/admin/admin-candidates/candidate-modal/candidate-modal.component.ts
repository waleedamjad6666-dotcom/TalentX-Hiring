import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-candidate-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './candidate-modal.component.html'
})
export class CandidateModalComponent {
  private adminService = inject(AdminService);

  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  isSubmitting = signal(false);
  selectedFileName = signal('');
  private selectedFile: File | null = null;

  form = new FormGroup({
    firstname: new FormControl('', { nonNullable: true, validators: Validators.required }),
    lastname: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: Validators.required }),
    experience: new FormControl('', { nonNullable: true }),
    currentCompany: new FormControl('', { nonNullable: true }),
    currentPosition: new FormControl('', { nonNullable: true }),
    skills: new FormControl('', { nonNullable: true })
  });

  close() {
    this.closed.emit();
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close();
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName.set(this.selectedFile.name);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.selectedFileName.set('');
  }

  submit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);

    const formData = new FormData();
    const v = this.form.value;

    formData.append('firstname', v.firstname!);
    formData.append('lastname', v.lastname!);
    formData.append('email', v.email!);
    formData.append('phone', v.phone!);
    formData.append('experience', v.experience || '');
    formData.append('currentCompany', v.currentCompany || '');
    formData.append('currentPosition', v.currentPosition || '');
    formData.append('skills', v.skills || '');

    if (this.selectedFile) {
      formData.append('resume', this.selectedFile);
    }

    this.adminService.createCandidate(formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.created.emit();
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}

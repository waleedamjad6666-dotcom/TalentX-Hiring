import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { ApiCandidate } from '../../../../core/models';

@Component({
  selector: 'app-candidate-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './candidate-modal.component.html'
})
export class CandidateModalComponent implements OnInit {
  private adminService = inject(AdminService);

  @Input() candidate: ApiCandidate | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  isSubmitting = signal(false);
  selectedFileName = signal('');
  private selectedFile: File | null = null;

  isEditMode = signal(false);

  form = new FormGroup({
    firstname: new FormControl('', { nonNullable: true, validators: Validators.required }),
    lastname: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: Validators.required }),
    experience: new FormControl('', { nonNullable: true }),
    currentCompany: new FormControl('', { nonNullable: true }),
    currentPosition: new FormControl('', { nonNullable: true }),
    skills: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true })
  });

  ngOnInit() {
    if (this.candidate) {
      this.isEditMode.set(true);
      this.form.patchValue({
        firstname: this.candidate.firstname,
        lastname: this.candidate.lastname,
        email: this.candidate.email,
        phone: this.candidate.phone,
        experience: this.candidate.experience || '',
        currentCompany: this.candidate.currentCompany || '',
        currentPosition: this.candidate.currentPosition || '',
        skills: this.candidate.skills?.join(', ') || ''
      });
    }
  }

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
    formData.append('notes', v.notes || '');

    if (this.selectedFile) {
      formData.append('resume', this.selectedFile);
    }

    if (this.isEditMode() && this.candidate) {
      this.adminService.updateCandidate(this.candidate.id, formData as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.updated.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
    } else {
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
}

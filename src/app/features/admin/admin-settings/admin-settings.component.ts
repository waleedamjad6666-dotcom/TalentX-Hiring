import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

type SettingsTab = 'admin' | 'interviewer' | 'position';

@Component({
  selector: 'app-admin-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-settings.component.html'
})
export class AdminSettingsComponent implements OnInit {
  adminService = inject(AdminService);

  activeTab = signal<SettingsTab>('admin');
  submitting = signal(false);
  errorMsg = '';
  successMsg = '';

  showAdminPassword = signal(false);
  showInterviewerPassword = signal(false);

  adminForm = new FormGroup({
    firstname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    designation: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true })
  });

  interviewerForm = new FormGroup({
    firstname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    designation: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true })
  });

  positionForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    departmentId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    requiredSkills: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    minimumExperience: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    maximumExperience: new FormControl<number | null>(null),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl('open', { nonNullable: true })
  });

  ngOnInit() {
    this.adminService.loadDepartments();
  }

  switchTab(tab: SettingsTab) {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  tabClasses(tab: SettingsTab) {
    const active = this.activeTab() === tab;
    return `flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
      active
        ? 'bg-[#FBBF24] text-black shadow-[0_0_12px_rgba(251,191,36,0.25)]'
        : 'text-neutral-400 hover:text-white hover:bg-[#1a1a1a]'
    }`;
  }

  headerTitle() {
    switch (this.activeTab()) {
      case 'admin': return 'Create New Admin';
      case 'interviewer': return 'Create New Interviewer';
      case 'position': return 'Create New Job Position';
    }
  }

  headerSubtitle() {
    switch (this.activeTab()) {
      case 'admin': return 'Grant a team member full administrative access.';
      case 'interviewer': return 'Add an interviewer who can conduct interviews and submit feedback.';
      case 'position': return 'Define a new open role to assign interviews against.';
    }
  }

  headerIcon() {
    switch (this.activeTab()) {
      case 'admin': return 'shield_person';
      case 'interviewer': return 'record_voice_over';
      case 'position': return 'work_outline';
    }
  }

  headerIconClasses() {
    return 'w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner bg-[#FBBF24]/10 border-[#FBBF24]/20 overflow-hidden';
  }

  headerIconColor() {
    return 'text-[#FBBF24]';
  }

  formFor(tab: SettingsTab): FormGroup {
    switch (tab) {
      case 'admin': return this.adminForm;
      case 'interviewer': return this.interviewerForm;
      case 'position': return this.positionForm;
    }
  }

  touched(tab: SettingsTab, control: string) {
    const ctrl = this.formFor(tab).get(control);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  resetForm(tab: SettingsTab) {
    const form = this.formFor(tab);
    form.reset();
    if (tab === 'position') {
      form.patchValue({ status: 'open' });
    }
    this.clearMessages();
  }

  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }

  createUser(role: 'admin' | 'interviewer') {
    const form = role === 'admin' ? this.adminForm : this.interviewerForm;
    if (form.invalid) return;

    this.submitting.set(true);
    this.clearMessages();

    const v = form.getRawValue();
    this.adminService.createUser({
      firstname: v.firstname,
      lastname: v.lastname,
      email: v.email,
      password: v.password,
      role,
      designation: v.designation || undefined,
      phone: v.phone || undefined
    }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.successMsg = `${role === 'admin' ? 'Admin' : 'Interviewer'} created successfully! Credentials sent for ${res.user.email} (${res.user.employeeId}).`;
        form.reset();
        if (role === 'interviewer') {
          this.adminService.loadScheduleData();
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg = err.error?.message || `Failed to create ${role}`;
      }
    });
  }

  createPosition() {
    if (this.positionForm.invalid) return;

    this.submitting.set(true);
    this.clearMessages();

    const v = this.positionForm.getRawValue();
    const skills = v.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);

    this.adminService.createPosition({
      title: v.title,
      departmentId: v.departmentId,
      requiredSkills: skills,
      minimumExperience: Number(v.minimumExperience),
      maximumExperience: v.maximumExperience !== null ? Number(v.maximumExperience) : undefined,
      description: v.description,
      status: v.status
    }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.successMsg = `Position "${res.position.title}" created successfully!`;
        this.positionForm.reset();
        this.positionForm.patchValue({ status: 'open' });
        this.adminService.loadScheduleData();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg = err.error?.message || 'Failed to create position';
      }
    });
  }
}

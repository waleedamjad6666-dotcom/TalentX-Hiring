import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormsModule } from '@angular/forms';

type SettingsTab = 'admin' | 'interviewer' | 'questionnaire';

@Component({
  selector: 'app-admin-settings',
  imports: [ReactiveFormsModule, FormsModule],
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

  // Questionnaire Template Editing State
  editingTemplateId = signal<string | null>(null);

  // Questionnaire Template Form
  templateForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    questions: new FormArray<FormControl<string>>([
      new FormControl('Why are you looking to leave your current company?', { nonNullable: true, validators: [Validators.required] }),
      new FormControl('What is your current and expected CTC / Salary?', { nonNullable: true, validators: [Validators.required] }),
      new FormControl('What is your official notice period or earliest possible start date?', { nonNullable: true, validators: [Validators.required] }),
      new FormControl('Please provide a brief introduction about yourself and key achievements.', { nonNullable: true, validators: [Validators.required] })
    ])
  });

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

  ngOnInit() {
    this.adminService.loadDepartments();
    this.adminService.loadQuestionnaireTemplates();
  }

  get questionsArray(): FormArray<FormControl<string>> {
    return this.templateForm.get('questions') as FormArray<FormControl<string>>;
  }

  addQuestion(defaultText = '') {
    this.questionsArray.push(new FormControl(defaultText, { nonNullable: true, validators: [Validators.required] }));
  }

  removeQuestion(index: number) {
    if (this.questionsArray.length > 1) {
      this.questionsArray.removeAt(index);
    }
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
      case 'questionnaire': return 'Pre-Interview Questionnaire Templates';
    }
  }

  headerSubtitle() {
    switch (this.activeTab()) {
      case 'admin': return 'Grant a team member full administrative access.';
      case 'interviewer': return 'Add an interviewer who can conduct interviews and submit feedback.';
      case 'questionnaire': return 'Configure question templates to send to candidates prior to Round 1 scheduling.';
    }
  }

  headerIcon() {
    switch (this.activeTab()) {
      case 'admin': return 'shield';
      case 'interviewer': return 'record_voice_over';
      case 'questionnaire': return 'quiz';
    }
  }

  headerIconClasses() {
    return 'w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner bg-[#FBBF24]/10 border-[#FBBF24]/20 overflow-hidden';
  }

  headerIconColor() {
    return 'text-[#FBBF24]';
  }

  formFor(tab: 'admin' | 'interviewer'): FormGroup {
    switch (tab) {
      case 'admin': return this.adminForm;
      case 'interviewer': return this.interviewerForm;
    }
  }

  touched(tab: 'admin' | 'interviewer', control: string) {
    const ctrl = this.formFor(tab).get(control);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  resetForm(tab: SettingsTab) {
    if (tab === 'questionnaire') {
      this.cancelEditTemplate();
    } else {
      this.formFor(tab).reset();
    }
    this.clearMessages();
  }

  clearMessages() {
    this.errorMsg = '';
    this.successMsg = '';
  }

  editTemplate(tmpl: { id: string; name: string; questions: string[] }) {
    this.editingTemplateId.set(tmpl.id);
    this.clearMessages();
    this.templateForm.get('name')?.setValue(tmpl.name);
    
    // Clear existing controls in FormArray
    while (this.questionsArray.length !== 0) {
      this.questionsArray.removeAt(0);
    }
    
    // Add questions from template
    if (tmpl.questions && tmpl.questions.length > 0) {
      tmpl.questions.forEach(q => this.addQuestion(q));
    } else {
      this.addQuestion('');
    }

    // Scroll to top of settings container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEditTemplate() {
    this.editingTemplateId.set(null);
    this.templateForm.get('name')?.setValue('');
    while (this.questionsArray.length !== 0) {
      this.questionsArray.removeAt(0);
    }
    [
      'Why are you looking to leave your current company?',
      'What is your current and expected CTC / Salary?',
      'What is your official notice period or earliest possible start date?',
      'Please provide a brief introduction about yourself and key achievements.'
    ].forEach(q => this.addQuestion(q));
  }

  saveTemplate() {
    if (this.templateForm.invalid) return;

    this.submitting.set(true);
    this.clearMessages();

    const v = this.templateForm.getRawValue();
    const cleanQuestions = v.questions.map(q => q.trim()).filter(q => q.length > 0);

    if (cleanQuestions.length === 0) {
      this.submitting.set(false);
      this.errorMsg = 'At least one question is required.';
      return;
    }

    const editId = this.editingTemplateId();

    if (editId) {
      // Update existing template
      this.adminService.updateQuestionnaireTemplate(editId, {
        name: v.name.trim(),
        questions: cleanQuestions
      }).subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.successMsg = `Template "${res.name}" updated successfully!`;
          this.cancelEditTemplate();
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMsg = err.error?.message || 'Failed to update questionnaire template';
        }
      });
    } else {
      // Create new template
      this.adminService.createQuestionnaireTemplate({
        name: v.name.trim(),
        questions: cleanQuestions
      }).subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.successMsg = `Template "${res.name}" created successfully with ${res.questions.length} questions!`;
          this.cancelEditTemplate();
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMsg = err.error?.message || 'Failed to create questionnaire template';
        }
      });
    }
  }

  deleteTemplate(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) {
      return;
    }

    this.clearMessages();
    this.adminService.deleteQuestionnaireTemplate(id).subscribe({
      next: () => {
        if (this.editingTemplateId() === id) {
          this.cancelEditTemplate();
        }
        this.successMsg = `Template "${name}" deleted successfully.`;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to delete questionnaire template';
      }
    });
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
}

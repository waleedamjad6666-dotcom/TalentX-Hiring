import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { ApiPositionWithDepartment, BatchMatchingResponse, ProcessedResumeResult } from '../../../../core/models';

@Component({
  selector: 'app-ai-resume-matcher-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-resume-matcher-modal.component.html'
})
export class AiResumeMatcherModalComponent implements OnInit {
  adminService = inject(AdminService);
  private router = inject(Router);

  @Input() initialPositionId: string | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() screeningCompleted = new EventEmitter<void>();

  selectedPositionId = signal<string>('');
  selectedFiles = signal<File[]>([]);
  isDragging = signal<boolean>(false);
  isProcessing = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Results State
  resultsData = signal<BatchMatchingResponse | null>(null);
  activeTab = signal<'ALL' | 'SHORTLISTED' | 'TIER_1_TOP' | 'TIER_2_STRONG' | 'TIER_3_GOOD' | 'NEGLECTED'>('ALL');

  ngOnInit() {
    this.adminService.loadScheduleData();
    if (this.initialPositionId) {
      this.selectedPositionId.set(this.initialPositionId);
    } else if (this.adminService.positions().length > 0) {
      this.selectedPositionId.set(this.adminService.positions()[0].id);
    }
  }

  getSelectedPosition(): ApiPositionWithDepartment | undefined {
    return this.adminService.positions().find(p => p.id === this.selectedPositionId());
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !this.isProcessing()) {
      this.close();
    }
  }

  close() {
    if (this.isProcessing()) return;
    this.closed.emit();
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);

    if (e.dataTransfer && e.dataTransfer.files) {
      this.addFiles(Array.from(e.dataTransfer.files));
    }
  }

  onFileInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
  }

  addFiles(files: File[]) {
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const validFiles = files.filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return validExtensions.includes(ext);
    });

    if (validFiles.length < files.length) {
      this.errorMessage.set('Some files were skipped. Only PDF, DOC, and DOCX formats are supported.');
    } else {
      this.errorMessage.set(null);
    }

    const current = this.selectedFiles();
    // Avoid duplicate filenames
    const currentNames = new Set(current.map(f => f.name));
    const newFiles = validFiles.filter(f => !currentNames.has(f.name));

    this.selectedFiles.set([...current, ...newFiles]);
  }

  removeFile(index: number) {
    const current = [...this.selectedFiles()];
    current.splice(index, 1);
    this.selectedFiles.set(current);
  }

  clearFiles() {
    this.selectedFiles.set([]);
    this.errorMessage.set(null);
  }

  startScreening() {
    if (!this.selectedPositionId()) {
      this.errorMessage.set('Please select a target job position.');
      return;
    }

    if (this.selectedFiles().length === 0) {
      this.errorMessage.set('Please select at least one resume file to evaluate.');
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set(null);

    this.adminService.bulkMatchResumes(this.selectedPositionId(), this.selectedFiles()).subscribe({
      next: (response) => {
        this.resultsData.set(response);
        this.isProcessing.set(false);
        this.screeningCompleted.emit();
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to complete AI resume screening. Please try again.');
      }
    });
  }

  resetAnalysis() {
    this.resultsData.set(null);
    this.selectedFiles.set([]);
    this.errorMessage.set(null);
    this.activeTab.set('ALL');
  }

  filteredResults(): ProcessedResumeResult[] {
    const data = this.resultsData();
    if (!data) return [];

    const tab = this.activeTab();
    if (tab === 'ALL') return data.results;
    if (tab === 'SHORTLISTED') return data.results.filter(r => r.evaluation.shortlisted);
    if (tab === 'NEGLECTED') return data.results.filter(r => !r.evaluation.shortlisted);
    return data.results.filter(r => r.evaluation.tier === tab);
  }

  getScoreColorClass(score: number): { badge: string; text: string; ring: string; border: string; bg: string } {
    if (score >= 95) {
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        text: 'text-emerald-400',
        ring: 'stroke-emerald-500',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/5'
      };
    } else if (score >= 85) {
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        text: 'text-amber-400',
        ring: 'stroke-amber-500',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/5'
      };
    } else if (score >= 75) {
      return {
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        text: 'text-blue-400',
        ring: 'stroke-blue-500',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/5'
      };
    } else {
      return {
        badge: 'bg-neutral-800 text-neutral-400 border-neutral-700',
        text: 'text-neutral-400',
        ring: 'stroke-neutral-600',
        border: 'border-neutral-800',
        bg: 'bg-neutral-900/40'
      };
    }
  }

  getTierLabel(tier: string): string {
    switch (tier) {
      case 'TIER_1_TOP':
        return 'Tier 1 • Top Pick (≥95%)';
      case 'TIER_2_STRONG':
        return 'Tier 2 • Strong Match (85-94%)';
      case 'TIER_3_GOOD':
        return 'Tier 3 • Good Fit (75-84%)';
      default:
        return 'Neglected (<75%)';
    }
  }

  viewCandidateProfile(candidateId: string) {
    this.close();
    this.router.navigate(['/admin/candidates', candidateId]);
  }
}

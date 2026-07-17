import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-interviewer-feedback',
  imports: [ReactiveFormsModule],
  template: `
    @if (interview()) {
      <div class="max-w-4xl mx-auto pb-10">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row gap-6 sm:items-center mb-8 border-b border-[#262626] pb-8">
          <div class="w-20 h-20 rounded-2xl bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20 flex items-center justify-center font-extrabold text-3xl shadow-inner flex-shrink-0">
             {{ getInitials(candidate()?.name) }}
          </div>
          <div class="flex-1">
            <div class="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span class="hover:text-white cursor-pointer transition-colors" (click)="router.navigate(['/interviewer/dashboard'])">Interviews</span> 
              <span class="material-icons text-[14px]">chevron_right</span> Feedback Form
            </div>
            <h1 class="text-4xl font-extrabold text-white mb-2 tracking-tight">{{ candidate()?.name }}</h1>
            <p class="text-neutral-400 font-medium text-lg">
              <span class="text-[#FBBF24]">{{ candidate()?.role }}</span> <span class="mx-2 opacity-30">|</span> Technical Interview
            </p>
          </div>
          <div class="flex flex-col gap-2 items-start sm:items-end">
             <span class="bg-[#111111] border border-[#333] text-neutral-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">ID: {{ interview()?.id }}</span>
             <span class="bg-[#FBBF24] text-black px-4 py-1.5 rounded-full text-xs font-extrabold tracking-widest shadow-[0_0_10px_rgba(251,191,36,0.3)]">IN PROGRESS</span>
          </div>
        </div>

        <form [formGroup]="form" class="space-y-8">
          <!-- Top Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
             <!-- Rating Card -->
             <div class="bg-[#161616] border border-[#262626] rounded-3xl p-8 shadow-xl">
                <h3 class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-5">Overall Performance Rating</h3>
                <div class="flex gap-3 mb-8">
                   @for (star of [1,2,3,4,5]; track star) {
                     <span class="material-icons text-5xl cursor-pointer transition-all hover:scale-110"
                           (click)="rating.set(star)"
                           [class.text-[#FBBF24]]="star <= rating()"
                           [class.drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]]="star <= rating()"
                           [class.text-[#333]]="star > rating()">
                       {{ star <= rating() ? 'star' : 'star_border' }}
                     </span>
                   }
                </div>
                <div class="border-t border-[#262626] pt-8">
                   <h3 class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Recommended Status</h3>
                   <div class="relative">
                     <select formControlName="recommended" class="w-full bg-[#111111] border border-[#333] rounded-xl py-4 px-5 text-white font-medium outline-none focus:border-[#FBBF24] appearance-none transition-colors">
                        <option value="" disabled>Select Recommendation</option>
                        <option value="Yes">Yes, Recommend for Hire</option>
                        <option value="No">No, Do Not Recommend</option>
                        <option value="Hold">Hold for Review</option>
                     </select>
                     <span class="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">expand_more</span>
                   </div>
                </div>
             </div>

             <!-- Strengths & Updates -->
             <div class="bg-[#161616] border border-[#262626] rounded-3xl p-8 shadow-xl">
                <h3 class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-5">Primary Strengths</h3>
                <div class="flex flex-wrap gap-2 mb-8">
                  <span class="px-4 py-2 rounded-full border border-[#333] text-sm font-medium text-neutral-300 hover:bg-[#1a1a1a] hover:border-[#555] cursor-pointer transition-all">Architecture</span>
                  <span class="px-4 py-2 rounded-full border border-[#333] text-sm font-medium text-neutral-300 hover:bg-[#1a1a1a] hover:border-[#555] cursor-pointer transition-all">Communication</span>
                  <span class="px-4 py-2 rounded-full border border-[#333] text-sm font-medium text-neutral-300 hover:bg-[#1a1a1a] hover:border-[#555] cursor-pointer transition-all">Problem Solving</span>
                  <span class="px-4 py-2 rounded-full border border-[#333] text-sm font-medium text-neutral-300 hover:bg-[#1a1a1a] hover:border-[#555] cursor-pointer transition-all">React Expertise</span>
                </div>
                <div class="border-t border-[#262626] pt-8">
                   <h3 class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-5">Hiring Updates</h3>
                   <div class="flex flex-col sm:flex-row gap-6">
                      <label class="flex items-center gap-3 cursor-pointer group">
                         <input type="checkbox" class="w-5 h-5 rounded border-[#444] bg-[#111111] checked:bg-[#FBBF24] accent-[#FBBF24] cursor-pointer">
                         <span class="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Send to HR Ops</span>
                      </label>
                      <label class="flex items-center gap-3 cursor-pointer group">
                         <input type="checkbox" class="w-5 h-5 rounded border-[#444] bg-[#111111] checked:bg-[#FBBF24] accent-[#FBBF24] cursor-pointer">
                         <span class="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Notify Manager</span>
                      </label>
                   </div>
                </div>
             </div>
          </div>

          <!-- Textareas Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-[#161616] p-6 rounded-3xl border border-[#262626]">
              <h3 class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 ml-2">Positive Comments</h3>
              <textarea formControlName="positive" rows="5" class="w-full bg-[#111111] border border-[#333] rounded-2xl p-5 text-white outline-none focus:border-[#FBBF24] resize-none transition-colors" placeholder="What did the candidate excel at during this interview?"></textarea>
            </div>
            <div class="bg-[#161616] p-6 rounded-3xl border border-[#262626]">
              <h3 class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 ml-2">Negative Comments</h3>
              <textarea formControlName="negative" rows="5" class="w-full bg-[#111111] border border-[#333] rounded-2xl p-5 text-white outline-none focus:border-[#FBBF24] resize-none transition-colors" placeholder="Identify specific gaps or red flags encountered..."></textarea>
            </div>
          </div>

          <div class="bg-[#161616] p-6 rounded-3xl border border-[#262626]">
            <h3 class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 ml-2">Additional Comments & Cultural Fit</h3>
            <textarea formControlName="additional" rows="4" class="w-full bg-[#111111] border border-[#333] rounded-2xl p-5 text-white outline-none focus:border-[#FBBF24] resize-none transition-colors" placeholder="Any other observations worth noting for the hiring committee?"></textarea>
          </div>

          <!-- Footer Actions -->
          <div class="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#262626] gap-6">
             <div class="flex items-center gap-2 text-neutral-500 font-medium text-sm">
               <span class="material-icons text-[18px]">info</span> Autosaved just now
             </div>
             <div class="flex gap-4 w-full sm:w-auto">
               <button type="button" class="flex-1 sm:flex-none px-8 py-4 rounded-xl border border-[#333] text-white font-bold hover:bg-[#1a1a1a] transition-colors">Save Draft</button>
               <button type="button" (click)="submit()" [disabled]="!rating() || !form.value.recommended" class="flex-1 sm:flex-none px-10 py-4 rounded-xl bg-[#FBBF24] hover:bg-[#FACC15] text-black font-extrabold disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(251,191,36,0.15)] hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:shadow-none">Submit Evaluation</button>
             </div>
          </div>
        </form>
      </div>
    }
  `
})
export class InterviewerFeedbackComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);

  interviewId = this.route.snapshot.paramMap.get('id');
  
  interview = computed(() => this.dataService.interviews().find(i => i.id === this.interviewId));
  candidate = computed(() => {
    const inv = this.interview();
    return inv ? this.dataService.candidates().find(c => c.id === inv.candidateId) : null;
  });

  rating = signal(0);

  form = new FormGroup({
    recommended: new FormControl('', {nonNullable: true}),
    positive: new FormControl('', {nonNullable: true}),
    negative: new FormControl('', {nonNullable: true}),
    additional: new FormControl('', {nonNullable: true})
  });

  getInitials(name: string | undefined) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }

  submit() {
    const v = this.form.value;
    this.dataService.submitFeedback(this.interviewId!, {
      rating: this.rating(),
      recommended: v.recommended as 'Yes' | 'No' | 'Hold',
      positive: v.positive!,
      negative: v.negative!,
      additional: v.additional!
    });
    this.router.navigate(['/interviewer/dashboard']);
  }
}

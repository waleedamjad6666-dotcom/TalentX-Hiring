import { Component, inject, signal } from '@angular/core';
import { DataService } from '../data.service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-schedule',
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto pb-10">
      <div class="flex justify-between items-center mb-8 border-b border-[#262626] pb-4">
         <h1 class="text-3xl font-bold text-white">Schedule Interview</h1>
         <div class="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-1.5 shadow-inner">
           <span class="material-icons text-[16px] text-[#FBBF24]">admin_panel_settings</span>
           <span class="text-xs font-bold text-white tracking-wide uppercase">Admin</span>
         </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-[#161616] border border-[#262626] rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 class="text-xl font-bold text-white mb-1">Create New Interview</h2>
            <p class="text-neutral-400 text-sm mb-8 font-medium">Configure session details for the candidate.</p>

            <form [formGroup]="form" class="space-y-6">
              <div>
                <div class="flex justify-between mb-2 items-end">
                  <label class="block text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Candidate</label>
                  <label class="flex items-center gap-2 text-xs font-bold text-white cursor-pointer bg-[#111111] border border-[#333] px-3 py-1 rounded-lg">
                    <input type="checkbox" [checked]="isNewCandidate()" (change)="isNewCandidate.set(!isNewCandidate())" class="accent-[#FBBF24]">
                    Add New Candidate
                  </label>
                </div>
                
                @if (!isNewCandidate()) {
                  <div class="relative group">
                    <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#FBBF24] transition-colors">search</span>
                    <select formControlName="candidateId" class="w-full bg-[#111111] border border-[#333] rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-[#FBBF24] appearance-none transition-colors">
                      <option value="">Search by name or email...</option>
                      @for (c of dataService.candidates(); track c.id) {
                        <option [value]="c.id">{{ c.name }} ({{ c.role }})</option>
                      }
                    </select>
                  </div>
                } @else {
                  <div [formGroup]="newCandidateForm" class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#111111] border border-[#333] p-4 rounded-xl shadow-inner">
                    <input type="text" formControlName="name" placeholder="Full Name" class="bg-[#161616] border border-[#262626] rounded-lg px-4 py-2 text-white outline-none focus:border-[#FBBF24]">
                    <input type="text" formControlName="role" placeholder="Role (e.g. Frontend Developer)" class="bg-[#161616] border border-[#262626] rounded-lg px-4 py-2 text-white outline-none focus:border-[#FBBF24]">
                    <select formControlName="department" class="bg-[#161616] border border-[#262626] rounded-lg px-4 py-2 text-white outline-none focus:border-[#FBBF24] appearance-none">
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Data">Data</option>
                      <option value="Product">Product</option>
                      <option value="HR">HR</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                    </select>
                    <select formControlName="experience" class="bg-[#161616] border border-[#262626] rounded-lg px-4 py-2 text-white outline-none focus:border-[#FBBF24] appearance-none">
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3 Years">3 Years</option>
                      <option value="4 Years">4 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>
                }
              </div>

              <div>
                <label class="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Interviewer</label>
                <div class="relative">
                  <select formControlName="interviewer" class="w-full bg-[#111111] border border-[#333] rounded-xl py-3.5 px-4 text-white outline-none focus:border-[#FBBF24] appearance-none transition-colors">
                     <option value="">Select Interviewer</option>
                     <option value="Sarah Malik">Sarah Malik</option>
                     <option value="Daniel Shah">Daniel Shah</option>
                     <option value="Ali Hassan">Ali Hassan</option>
                     <option value="Ahmed Khan">Ahmed Khan</option>
                     <option value="Aisha Noor">Aisha Noor</option>
                     <option value="Michael Reed">Michael Reed</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                  <div class="relative">
                    <input type="date" formControlName="date" class="w-full bg-[#111111] border border-[#333] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FBBF24] transition-colors [color-scheme:dark]">
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Time (Local)</label>
                  <div class="relative">
                    <input type="time" formControlName="time" class="w-full bg-[#111111] border border-[#333] rounded-xl py-3 px-4 text-white outline-none focus:border-[#FBBF24] transition-colors [color-scheme:dark]">
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Duration</label>
                  <select formControlName="duration" class="w-full bg-[#111111] border border-[#333] rounded-xl py-3.5 px-4 text-white outline-none focus:border-[#FBBF24] appearance-none transition-colors">
                    <option>30 Minutes</option>
                    <option>45 Minutes</option>
                    <option>60 Minutes</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Interview Round</label>
                  <select formControlName="round" class="w-full bg-[#111111] border border-[#333] rounded-xl py-3.5 px-4 text-white outline-none focus:border-[#FBBF24] appearance-none transition-colors">
                    <option>Technical Assessment</option>
                    <option>Culture Fit</option>
                    <option>System Design</option>
                  </select>
                </div>
              </div>

              <div class="flex gap-4 pt-6 mt-4 border-t border-[#262626]">
                <button type="button" (click)="schedule()" [disabled]="!isFormValid()" class="flex-1 bg-[#FBBF24] hover:bg-[#FACC15] text-black font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.15)] hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                  <span class="material-icons text-[20px]">calendar_month</span> Schedule Interview
                </button>
                <button type="button" routerLink="/admin/dashboard" class="px-8 bg-[#111111] border border-[#333] hover:bg-[#1a1a1a] text-white font-bold rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Right Column Calendar -->
        <div class="space-y-6">
          <div class="bg-[#161616] border border-[#262626] rounded-2xl p-6 shadow-xl">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-bold text-white">Availability Map</h3>
              <div class="flex gap-2 text-neutral-400">
                <button class="w-8 h-8 rounded-lg bg-[#111111] border border-[#333] hover:text-white hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"><span class="material-icons text-sm">chevron_left</span></button>
                <button class="w-8 h-8 rounded-lg bg-[#111111] border border-[#333] hover:text-white hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"><span class="material-icons text-sm">chevron_right</span></button>
              </div>
            </div>
            <div class="grid grid-cols-7 gap-2 text-center mb-3">
              <div class="text-[10px] font-bold text-neutral-500 uppercase">Mon</div>
              <div class="text-[10px] font-bold text-neutral-500 uppercase">Tue</div>
              <div class="text-[10px] font-bold text-neutral-500 uppercase">Wed</div>
              <div class="text-[10px] font-bold text-neutral-500 uppercase">Thu</div>
              <div class="text-[10px] font-bold text-[#FBBF24] uppercase">Fri</div>
              <div class="text-[10px] font-bold text-neutral-500 uppercase">Sat</div>
              <div class="text-[10px] font-bold text-neutral-500 uppercase">Sun</div>
            </div>
            <div class="grid grid-cols-7 gap-2 text-center">
              <div class="py-2.5 text-sm font-medium text-neutral-600 rounded-lg border border-transparent">20</div>
              <div class="py-2.5 text-sm font-medium text-neutral-600 rounded-lg border border-transparent">21</div>
              <div class="py-2.5 text-sm font-medium text-neutral-600 rounded-lg border border-transparent">22</div>
              <div class="py-2.5 text-sm font-medium text-neutral-300 rounded-lg border border-transparent">23</div>
              <div class="py-2.5 text-sm font-bold text-black bg-[#FBBF24] rounded-lg shadow-[0_0_10px_rgba(251,191,36,0.3)]">24</div>
              <div class="py-2.5 text-sm font-medium text-neutral-300 rounded-lg border border-[#333] bg-[#111111]">25</div>
              <div class="py-2.5 text-sm font-medium text-neutral-300 rounded-lg border border-[#333] bg-[#111111]">26</div>
            </div>
          </div>

          <div class="bg-[#161616] border border-[#262626] rounded-2xl p-6 shadow-xl">
            <h3 class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-[#FBBF24] shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div> CONFLICT CHECK <span class="text-white ml-auto">OCT 24</span>
            </h3>
            <div class="space-y-4">
              <div class="bg-[#111111] border border-[#333] rounded-xl p-4 flex gap-4">
                <div class="text-sm font-bold text-neutral-400 w-12 mt-0.5">09:00</div>
                <div>
                  <div class="text-sm font-bold text-white">Standup Meeting</div>
                  <div class="text-xs text-neutral-500 font-medium mt-0.5">Team internal</div>
                </div>
              </div>
              <div class="bg-[#111111] border-l-4 border-l-[#FBBF24] border-t border-r border-b border-[#333] rounded-xl p-4 flex gap-4 items-center">
                <div class="text-sm font-bold text-neutral-300 w-10">11:30</div>
                <div class="flex-1">
                  <div class="text-sm font-bold text-white">Alex Rivera (UI/UX)</div>
                  <div class="text-xs font-semibold text-[#FBBF24] mt-0.5">Interview Scheduled</div>
                </div>
                <span class="material-icons text-neutral-500 text-[18px]">event</span>
              </div>
              <div class="bg-[#1a1a1a] border border-dashed border-neutral-600 rounded-xl p-4 flex gap-4 opacity-70">
                <div class="text-sm font-bold text-neutral-400 w-12 mt-0.5">
                   {{ form.value.time ? form.value.time : '14:00' }}
                </div>
                <div>
                  <div class="text-sm font-bold text-white italic">NEW SLOT</div>
                  <div class="text-xs text-neutral-400 font-medium mt-0.5">Proposed duration {{ form.value.duration }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminScheduleComponent {
  dataService = inject(DataService);
  router = inject(Router);

  isNewCandidate = signal(false);

  form = new FormGroup({
    candidateId: new FormControl('', {nonNullable:true}),
    interviewer: new FormControl('', {nonNullable:true}),
    date: new FormControl('', {nonNullable:true}),
    time: new FormControl('', {nonNullable:true}),
    duration: new FormControl('45 Minutes', {nonNullable:true}),
    round: new FormControl('Technical Assessment', {nonNullable:true})
  });

  newCandidateForm = new FormGroup({
    name: new FormControl('', {nonNullable: true}),
    role: new FormControl('', {nonNullable: true}),
    department: new FormControl('Engineering', {nonNullable: true}),
    experience: new FormControl('1 Year', {nonNullable: true})
  });

  isFormValid() {
    if (!this.form.value.interviewer || !this.form.value.date || !this.form.value.time) return false;
    if (this.isNewCandidate()) {
      return this.newCandidateForm.valid && this.newCandidateForm.value.name;
    } else {
      return !!this.form.value.candidateId;
    }
  }

  schedule() {
    if (this.isFormValid()) {
      let candId = Number(this.form.value.candidateId);
      
      if (this.isNewCandidate()) {
        const nc = this.newCandidateForm.value;
        candId = Date.now();
        this.dataService.addCandidate({
          id: candId,
          name: nc.name!,
          role: nc.role!,
          department: nc.department!,
          experience: nc.experience!,
          company: 'New Applicant',
          appliedDate: new Date().toISOString().split('T')[0],
          status: 'Interviewing'
        });
      }

      const v = this.form.value;
      this.dataService.scheduleInterview({
        id: 'int_' + Date.now(),
        candidateId: candId,
        interviewerName: v.interviewer!,
        date: v.date!,
        time: v.time!,
        status: 'Scheduled'
      });
      this.router.navigate(['/admin/dashboard']);
    }
  }
}

import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  template: `
    <div class="max-w-6xl mx-auto pb-10">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Command Center</h1>
          <p class="text-neutral-400">Welcome back, Admin. Here's your recruitment overview for today.</p>
        </div>
        <a routerLink="/admin/schedule" class="bg-[#FBBF24] hover:bg-[#FACC15] text-black font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-[#FBBF24]/10">
          <span class="material-icons text-sm">add</span> Create New Interview
        </a>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div class="bg-[#161616] border border-[#262626] rounded-xl p-5 flex flex-col justify-between h-36">
          <div class="flex justify-between items-start">
            <div class="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-400"><span class="material-icons text-[18px]">calendar_today</span></div>
          </div>
          <div>
            <p class="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Interviews Today</p>
            <h2 class="text-4xl font-bold text-white">{{ dataService.interviewsTodayCount() > 9 ? dataService.interviewsTodayCount() : '0' + dataService.interviewsTodayCount() }}</h2>
          </div>
        </div>
        <div class="bg-[#161616] border border-[#262626] rounded-xl p-5 flex flex-col justify-between h-36">
          <div class="flex justify-between items-start">
            <div class="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-[#FBBF24]"><span class="material-icons text-[18px]">rate_review</span></div>
            @if (dataService.pendingFeedbackCount() > 0) {
              <span class="text-red-400 text-xs font-semibold">Action Req</span>
            }
          </div>
          <div>
            <p class="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Pending Feedback</p>
            <h2 class="text-4xl font-bold text-white">{{ dataService.pendingFeedbackCount() > 9 ? dataService.pendingFeedbackCount() : '0' + dataService.pendingFeedbackCount() }}</h2>
          </div>
        </div>
        <div class="bg-[#161616] border border-[#262626] rounded-xl p-5 flex flex-col justify-between h-36">
          <div class="flex justify-between items-start">
            <div class="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-400"><span class="material-icons text-[18px]">people</span></div>
            <span class="text-neutral-500 text-xs font-semibold">Total Talent</span>
          </div>
          <div>
            <p class="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">In Pipeline</p>
            <h2 class="text-4xl font-bold text-white">{{ dataService.totalPipelineCount() }}</h2>
          </div>
        </div>
        <div class="bg-[#161616] border border-[#FBBF24] rounded-xl p-5 flex flex-col justify-between h-36 relative overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-br from-[#FBBF24]/10 to-transparent"></div>
           <div class="relative flex justify-between items-start">
            <div class="w-8 h-8 rounded bg-[#FBBF24] flex items-center justify-center text-black"><span class="material-icons text-[18px]">gavel</span></div>
            @if (dataService.pendingDecisions().length > 0) {
              <span class="bg-[#FBBF24] text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase shadow-sm">Action Req</span>
            }
          </div>
          <div class="relative">
            <p class="text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-1">Pending Decisions</p>
            <h2 class="text-4xl font-bold text-white">{{ dataService.pendingDecisions().length > 9 ? dataService.pendingDecisions().length : '0' + dataService.pendingDecisions().length }}</h2>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div class="lg:col-span-2">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-white">Upcoming Interviews</h3>
            </div>
            <div class="space-y-3">
              @for (interview of upcomingInterviews(); track interview.id) {
                <div class="bg-[#161616] border border-[#262626] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="bg-[#111111] border border-[#333] rounded-lg w-14 h-14 flex flex-col items-center justify-center flex-shrink-0 shadow-inner">
                      <span class="text-[10px] font-bold text-neutral-500 uppercase leading-none">{{ getMonth(interview.date) }}</span>
                      <span class="text-xl font-extrabold text-white leading-tight mt-0.5">{{ getDay(interview.date) }}</span>
                    </div>
                    <div>
                       <h4 class="font-bold text-white">{{ getCandidateName(interview.candidateId) }}</h4>
                       <p class="text-sm text-neutral-400 mt-0.5">{{ getCandidateRole(interview.candidateId) }} • {{ interview.time }}</p>
                    </div>
                  </div>
                  <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div class="flex items-center gap-2 bg-[#111111] px-2 py-1 rounded-full border border-[#262626]">
                       <div class="w-6 h-6 rounded-full bg-[#262626] flex items-center justify-center text-[9px] font-bold text-white">{{ getInitials(interview.interviewerName) }}</div>
                       <span class="text-xs text-neutral-400 pr-1">{{ interview.interviewerName.split(' ')[0] }}</span>
                    </div>
                    <button class="w-9 h-9 rounded bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] flex items-center justify-center text-neutral-400 transition-colors">
                      <span class="material-icons text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              }
              @if (upcomingInterviews().length === 0) {
                 <div class="bg-[#161616] border border-[#262626] border-dashed rounded-xl p-8 text-center text-neutral-500">
                    No upcoming interviews in the pipeline.
                 </div>
              }
            </div>
         </div>
         
         <!-- Right Column -->
         <div class="space-y-6">
            <!-- Pending Decisions -->
            <div class="bg-[#161616] border border-[#262626] rounded-xl p-6">
               <h3 class="font-bold text-white mb-6">Pending Decisions</h3>
               <div class="space-y-4">
                 @for (decision of dataService.pendingDecisions(); track decision.id) {
                   <div class="bg-[#111111] border border-[#333] rounded-xl p-4 shadow-inner">
                     <div class="flex justify-between items-start mb-3">
                       <div>
                         <h4 class="font-bold text-white text-sm">{{ getCandidateName(decision.candidateId) }}</h4>
                         <p class="text-xs text-neutral-400 mt-0.5">{{ getCandidateRole(decision.candidateId) }}</p>
                       </div>
                       <div class="flex items-center gap-1 bg-[#262626] px-2 py-0.5 rounded-full">
                         <span class="material-icons text-[14px] text-[#FBBF24]">star</span>
                         <span class="text-xs font-bold text-white">{{ decision.feedback?.rating }}</span>
                       </div>
                     </div>
                     <p class="text-xs text-neutral-300 italic mb-4 line-clamp-2">"{{ decision.feedback?.additional || decision.feedback?.positive }}"</p>
                     
                     <div class="grid grid-cols-2 gap-2">
                        <button (click)="dataService.updateHiringDecision(decision.id, 'Offer Sent')" class="py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold rounded-lg transition-colors">
                          Hire
                        </button>
                        <button (click)="dataService.updateHiringDecision(decision.id, 'Proceed to Next Round')" class="py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-lg transition-colors">
                          Next Round
                        </button>
                        <button (click)="dataService.updateHiringDecision(decision.id, 'Hold')" class="py-2 bg-neutral-500/10 hover:bg-neutral-500/20 border border-neutral-600 text-neutral-400 text-xs font-bold rounded-lg transition-colors">
                          Hold
                        </button>
                        <button (click)="dataService.updateHiringDecision(decision.id, 'Rejected')" class="py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg transition-colors">
                          Reject
                        </button>
                     </div>
                   </div>
                 }
                 @if (dataService.pendingDecisions().length === 0) {
                    <div class="text-center text-neutral-500 text-sm py-4">
                       No pending decisions.
                    </div>
                 }
               </div>
            </div>

            <!-- Goal Card -->
            <div class="bg-[#FBBF24] rounded-xl p-6 text-black relative overflow-hidden shadow-lg shadow-[#FBBF24]/20">
               <h3 class="font-bold text-xl mb-1">HIRING SPRINT</h3>
               <p class="text-xs font-bold opacity-80 uppercase tracking-widest mb-6">Q4 Product Expansion</p>
               <h2 class="text-6xl font-extrabold mb-1 tracking-tighter">82%</h2>
               <p class="text-xs font-bold uppercase tracking-wider">Goal Reached</p>
               <span class="material-icons absolute -bottom-4 -right-4 text-8xl opacity-10 -rotate-12">rocket_launch</span>
            </div>
         </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  dataService = inject(DataService);
  upcomingInterviews = this.dataService.upcomingInterviews;

  getMonth(dateStr: string) {
    return new Date(dateStr).toLocaleString('default', { month: 'short' });
  }
  getDay(dateStr: string) {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }
  getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }
  getCandidateName(id: number) {
    return this.dataService.candidates().find(c => c.id === id)?.name || 'Unknown';
  }
  getCandidateRole(id: number) {
    return this.dataService.candidates().find(c => c.id === id)?.role || 'Role';
  }
}

import { Component, inject, computed } from '@angular/core';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-interviewer-dashboard',
  imports: [RouterLink],
  template: `
    <div class="max-w-6xl mx-auto pb-10">
      <div class="mb-8 border-b border-[#262626] pb-6">
         <h1 class="text-3xl font-bold text-white mb-2">My Interviews</h1>
         <p class="text-neutral-400 font-medium">Welcome back, {{ auth.currentUser()?.name }}. Review your upcoming schedules and past evaluations.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div class="bg-[#161616] border border-[#262626] rounded-2xl p-6 shadow-lg shadow-black/20">
          <p class="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-2">Total Conducted</p>
          <h2 class="text-5xl font-extrabold text-white">{{ pastInterviews().length }}</h2>
        </div>
        <div class="bg-[#161616] border border-[#262626] rounded-2xl p-6 shadow-lg shadow-black/20">
          <p class="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-2">Recommended for Hire</p>
          <h2 class="text-5xl font-extrabold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]">{{ hiredCount() }}</h2>
        </div>
        <div class="bg-[#161616] border border-[#262626] rounded-2xl p-6 shadow-lg shadow-black/20">
          <p class="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-2">Rejected</p>
          <h2 class="text-5xl font-extrabold text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.2)]">{{ rejectedCount() }}</h2>
        </div>
      </div>

      <div class="mb-12">
         <div class="flex items-center gap-3 mb-5">
           <h2 class="text-xl font-bold text-white">Upcoming Schedule</h2>
           <span class="bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold px-2 py-0.5 rounded-full">{{ upcomingInterviews().length }}</span>
         </div>
         
         @if (upcomingInterviews().length === 0) {
           <div class="bg-[#161616] border border-[#262626] border-dashed rounded-2xl p-10 text-center text-neutral-500 flex flex-col items-center">
             <span class="material-icons text-4xl mb-3 opacity-50">event_available</span>
             <p class="font-medium">No upcoming interviews scheduled.</p>
           </div>
         }
         <div class="grid gap-4 md:grid-cols-2">
           @for (inv of upcomingInterviews(); track inv.id) {
             <div class="bg-[#161616] border border-[#262626] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#333] transition-colors shadow-lg">
               <div>
                 <h3 class="font-bold text-xl text-white mb-1">{{ getCandidate(inv.candidateId)?.name }}</h3>
                 <p class="text-sm font-medium text-neutral-400 mb-4">{{ getCandidate(inv.candidateId)?.role }}</p>
                 <div class="flex items-center gap-2 text-xs font-bold text-[#FBBF24] bg-[#FBBF24]/10 w-max px-3 py-1.5 rounded-lg border border-[#FBBF24]/20">
                   <span class="material-icons text-[16px]">event</span> {{ inv.date }} at {{ inv.time }}
                 </div>
               </div>
               <a [routerLink]="['/interviewer/feedback', inv.id]" class="bg-[#FBBF24] hover:bg-[#FACC15] text-black font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_10px_rgba(251,191,36,0.15)] text-center whitespace-nowrap">
                 Evaluate Candidate
               </a>
             </div>
           }
         </div>
      </div>

      <div>
         <h2 class="text-xl font-bold text-white mb-5">Past Evaluations & Results</h2>
         <div class="bg-[#161616] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
           <div class="overflow-x-auto">
             <table class="w-full text-left text-sm whitespace-nowrap">
               <thead class="bg-[#111111] border-b border-[#262626] text-neutral-400 text-xs uppercase tracking-widest font-bold">
                 <tr>
                   <th class="p-5">Candidate</th>
                   <th class="p-5">Date</th>
                   <th class="p-5">Your Rating</th>
                   <th class="p-5">Your Recommendation</th>
                   <th class="p-5">Admin Decision</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-[#262626]">
                 @for (inv of pastInterviews(); track inv.id) {
                   <tr class="hover:bg-[#1a1a1a] transition-colors">
                     <td class="p-5">
                       <div class="font-bold text-white text-base">{{ getCandidate(inv.candidateId)?.name }}</div>
                       <div class="text-xs font-medium text-neutral-500 mt-0.5">{{ getCandidate(inv.candidateId)?.role }}</div>
                     </td>
                     <td class="p-5 text-neutral-300 font-medium">{{ inv.date }}</td>
                     <td class="p-5 text-[#FBBF24] font-bold flex items-center gap-1.5">
                        <span class="material-icons text-[18px]">star</span> {{ inv.feedback?.rating }}
                     </td>
                     <td class="p-5">
                       <span class="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase"
                             [class.bg-green-500/20]="inv.feedback?.recommended === 'Yes'" [class.text-green-400]="inv.feedback?.recommended === 'Yes'"
                             [class.bg-red-500/20]="inv.feedback?.recommended === 'No'" [class.text-red-400]="inv.feedback?.recommended === 'No'"
                             [class.bg-neutral-500/20]="inv.feedback?.recommended === 'Hold'" [class.text-neutral-400]="inv.feedback?.recommended === 'Hold'">
                         {{ inv.feedback?.recommended }}
                       </span>
                     </td>
                     <td class="p-5">
                       <span class="text-[11px] font-bold tracking-wide uppercase px-3 py-1 border rounded-full"
                             [class.border-green-500/30]="inv.hiringUpdate?.includes('Offer') || inv.hiringUpdate?.includes('Proceed')" [class.text-green-400]="inv.hiringUpdate?.includes('Offer') || inv.hiringUpdate?.includes('Proceed')" [class.bg-green-500/10]="inv.hiringUpdate?.includes('Offer') || inv.hiringUpdate?.includes('Proceed')"
                             [class.border-red-500/30]="inv.hiringUpdate?.includes('Reject')" [class.text-red-400]="inv.hiringUpdate?.includes('Reject')" [class.bg-red-500/10]="inv.hiringUpdate?.includes('Reject')"
                             [class.border-neutral-600]="!inv.hiringUpdate || inv.hiringUpdate?.includes('Hold') || inv.hiringUpdate?.includes('Await')" [class.text-neutral-400]="!inv.hiringUpdate || inv.hiringUpdate?.includes('Hold') || inv.hiringUpdate?.includes('Await')" [class.bg-neutral-500/10]="!inv.hiringUpdate || inv.hiringUpdate?.includes('Hold') || inv.hiringUpdate?.includes('Await')">
                          {{ inv.hiringUpdate || 'Pending' }}
                       </span>
                     </td>
                   </tr>
                 }
                 @if (pastInterviews().length === 0) {
                   <tr>
                     <td colspan="5" class="p-8 text-center text-neutral-500 font-medium">No past evaluations found.</td>
                   </tr>
                 }
               </tbody>
             </table>
           </div>
         </div>
      </div>
    </div>
  `
})
export class InterviewerDashboardComponent {
  dataService = inject(DataService);
  auth = inject(AuthService);

  myInterviews = computed(() => {
     const name = this.auth.currentUser()?.name;
     return this.dataService.interviews().filter(i => i.interviewerName === name);
  });

  upcomingInterviews = computed(() => this.myInterviews().filter(i => i.status === 'Scheduled').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  pastInterviews = computed(() => this.myInterviews().filter(i => i.status === 'Completed').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

  hiredCount = computed(() => this.pastInterviews().filter(i => i.feedback?.recommended === 'Yes').length);
  rejectedCount = computed(() => this.pastInterviews().filter(i => i.feedback?.recommended === 'No').length);

  getCandidate(id: number) {
    return this.dataService.candidates().find(c => c.id === id);
  }
}

import { Component, inject, computed, signal } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-admin-candidates',
  template: `
    <div class="max-w-6xl mx-auto pb-10">
      <h1 class="text-3xl font-bold text-white mb-2">Manage Candidates</h1>
      <p class="text-neutral-400 mb-8 max-w-xl">Efficiency driven talent acquisition. Review, filter, and progress candidates through the pipeline.</p>

      <!-- Filters Row -->
      <div class="flex flex-col md:flex-row gap-4 mb-8">
        <div class="flex-1 relative group">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#FBBF24] transition-colors">search</span>
          <input type="text" [value]="search()" (input)="updateSearch($event)" placeholder="Search by name, role, or keyword..." class="w-full bg-[#161616] border border-[#262626] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FBBF24] transition-colors shadow-inner">
        </div>
        <div class="flex gap-3">
          <select [value]="deptFilter()" (change)="updateDept($event)" class="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FBBF24] transition-colors appearance-none pr-8 relative">
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Data">Data</option>
            <option value="Product">Product</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
          </select>
          <select [value]="statusFilter()" (change)="updateStatus($event)" class="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-[#FBBF24] transition-colors appearance-none pr-8">
            <option value="">All Statuses</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer Sent">Offer Sent</option>
            <option value="Screening">Screening</option>
            <option value="Rejected">Rejected</option>
            <option value="Draft">Draft</option>
          </select>
          <button class="bg-[#161616] border border-[#262626] hover:bg-[#1a1a1a] rounded-xl px-4 py-3 text-white flex items-center gap-2 transition-colors">
            <span class="material-icons text-[18px]">filter_list</span> <span class="hidden sm:inline">More Filters</span>
          </button>
        </div>
      </div>

      <!-- Candidates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @for (c of filteredCandidates(); track c.id) {
          <div class="bg-[#161616] border border-[#262626] rounded-2xl p-6 flex flex-col hover:border-[#333] transition-all hover:shadow-lg hover:shadow-black/50">
            <div class="flex justify-between items-start mb-6">
              <div class="flex gap-4 items-center">
                <div class="w-12 h-12 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24] flex items-center justify-center font-bold text-xl border border-[#FBBF24]/20 shadow-inner">
                  {{ getInitials(c.name) }}
                </div>
                <div>
                  <h3 class="font-bold text-lg text-white leading-tight mb-0.5">{{ c.name }}</h3>
                  <p class="text-neutral-400 text-sm font-medium">{{ c.role }}</p>
                </div>
              </div>
              <span class="px-3 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase" [class]="statusClasses(c.status)">
                {{ c.status }}
              </span>
            </div>
            
            <div class="space-y-3.5 mb-8">
              <div class="flex justify-between text-sm">
                <span class="text-neutral-500 font-medium">Department</span>
                <span class="text-neutral-200 font-semibold">{{ c.department }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-neutral-500 font-medium">Experience</span>
                <span class="text-neutral-200 font-semibold">{{ c.experience }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-neutral-500 font-medium">Applied Date</span>
                <span class="text-neutral-200 font-semibold">{{ formatDate(c.appliedDate) }}</span>
              </div>
            </div>

            <div class="mt-auto flex gap-3">
              <button class="flex-1 bg-[#FBBF24]/10 hover:bg-[#FBBF24]/20 text-[#FBBF24] font-bold py-2.5 rounded-xl transition-colors border border-[#FBBF24]/20">
                View Details
              </button>
              <button class="w-12 flex-shrink-0 bg-[#111111] border border-[#333] hover:bg-[#1a1a1a] text-white rounded-xl flex items-center justify-center transition-colors">
                <span class="material-icons text-[20px]">more_vert</span>
              </button>
            </div>
          </div>
        }
        @if (filteredCandidates().length === 0) {
          <div class="col-span-full py-16 text-center border border-[#262626] border-dashed rounded-2xl bg-[#111111]">
            <span class="material-icons text-4xl text-neutral-600 mb-2">person_off</span>
            <h3 class="text-lg font-bold text-white">No candidates found</h3>
            <p class="text-neutral-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminCandidatesComponent {
  dataService = inject(DataService);

  search = signal('');
  deptFilter = signal('');
  statusFilter = signal('');

  filteredCandidates = computed(() => {
    const s = this.search().toLowerCase();
    const d = this.deptFilter();
    const st = this.statusFilter();
    
    return this.dataService.candidates().filter(c => {
      const matchSearch = c.name.toLowerCase().includes(s) || c.role.toLowerCase().includes(s);
      const matchDept = d ? c.department === d : true;
      const matchStatus = st ? c.status === st : true;
      return matchSearch && matchDept && matchStatus;
    });
  });

  updateSearch(e: Event) { this.search.set((e.target as HTMLInputElement).value); }
  updateDept(e: Event) { this.deptFilter.set((e.target as HTMLSelectElement).value); }
  updateStatus(e: Event) { this.statusFilter.set((e.target as HTMLSelectElement).value); }

  getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  }

  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  statusClasses(status: string) {
    switch(status) {
      case 'Interviewing': return 'border-blue-500/30 text-blue-400 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
      case 'Offer Sent': return 'border-green-500/30 text-green-400 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.1)]';
      case 'Screening': return 'border-orange-500/30 text-orange-400 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.1)]';
      case 'Rejected': return 'border-red-500/30 text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
      case 'Draft': return 'border-neutral-500/30 text-neutral-400 bg-neutral-500/10';
      default: return 'border-neutral-500/30 text-neutral-400 bg-neutral-500/10';
    }
  }
}

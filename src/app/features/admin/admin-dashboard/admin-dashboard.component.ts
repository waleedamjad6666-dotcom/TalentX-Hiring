import { Component, inject, computed, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { AdminService } from '../../../core/services/admin.service';
import { RouterLink } from '@angular/router';
import { getInitialsFromName } from '../../../shared/utils';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  dataService = inject(DataService);
  adminService = inject(AdminService);

  upcomingInterviews = computed(() => {
    return this.adminService.interviews()
      .filter(i => i.status === 'scheduled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  interviewsTodayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.adminService.interviews().filter(i => i.date === today).length;
  });

  ngOnInit() {
    this.adminService.fetchInterviews();
  }

  getMonth(dateStr: string) {
    return new Date(dateStr).toLocaleString('default', { month: 'short' });
  }
  getDay(dateStr: string) {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }
  getTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  getInitials(name: string) {
    return getInitialsFromName(name);
  }
  getCandidateName(interview: any) {
    return interview?.candidate ? `${interview.candidate.firstname} ${interview.candidate.lastname}` : 'Unknown';
  }
  getCandidateRole(interview: any) {
    return interview?.candidate?.currentPosition || interview?.position?.title || 'Role';
  }
}

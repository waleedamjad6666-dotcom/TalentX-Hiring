export interface Candidate {
  id: number;
  name: string;
  role: string;
  company: string;
  department: string;
  experience: string;
  appliedDate: string;
  status: string;
}

export interface Interview {
  id: string;
  candidateId: number;
  interviewerName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Pending Feedback';
  feedback?: {
    rating: number;
    positive: string;
    negative: string;
    additional: string;
    recommended: 'Yes' | 'No' | 'Hold';
  };
  hiringUpdate?: string;
}

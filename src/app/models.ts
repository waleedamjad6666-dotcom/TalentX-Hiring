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

export interface ApiCandidate {
  id: string;
  candidateCode: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  experience: string | null;
  currentCompany: string | null;
  currentPosition: string | null;
  skills: string[];
}

export interface ApiPosition {
  id: string;
  title: string;
  requiredSkills: string[];
  minimumExperience: number;
  maximumExperience: number | null;
  description: string;
  status: string;
}

export interface ApiUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface ApiInterview {
  id: string;
  round: number;
  type: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  candidateId: string;
  candidate: ApiCandidate;
  positionId: string;
  position: ApiPosition;
  createdBy: string;
  creator: ApiUser;
  interviewerIds: string[];
  interviewers: ApiUser[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiInterviewsResponse {
  interviews: ApiInterview[];
  count: number;
}

export interface ApiCandidateResponse {
  candidate: {
    id: string;
    candidateCode: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    experience: string;
    currentCompany: string;
    currentPosition: string;
    skills: string[];
    notes: string;
  };
}

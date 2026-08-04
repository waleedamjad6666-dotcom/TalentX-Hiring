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

export interface SubmitFeedbackRequest {
  interviewId: string;
  rating: number;
  recommendation: 'Yes' | 'No' | 'Hold';
  positiveComments: string;
  negativeComments: string;
  additionalComments: string;
}

export interface FeedbackResponse {
  id: string;
  interviewId: string;
  candidateId: string;
  interviewerId: string;
  interviewer?: ApiUser;
  rating: number;
  recommendation: string;
  positiveComments: string;
  negativeComments: string;
  additionalComments: string;
  submittedAt: string;
}

export interface SubmitFeedbackResponse {
  feedback: FeedbackResponse;
}

export interface GetFeedbackResponse {
  feedback: FeedbackResponse | null;
}

export interface ApiInterviewer {
  id: string;
  employeeId: string;
  firstname: string;
  lastname: string;
  email: string;
  designation: string | null;
}

export interface ApiDepartment {
  id: string;
  name: string;
}

export interface ApiPositionWithDepartment extends ApiPosition {
  department?: ApiDepartment;
}

export interface ApiCandidatesResponse {
  candidates: ApiCandidate[];
  count: number;
}

export interface ApiInterviewersResponse {
  interviewers: ApiInterviewer[];
}

export interface ApiPositionsResponse {
  positions: ApiPositionWithDepartment[];
}

export interface ApiInterviewsListResponse {
  interviews: ApiInterview[];
  count: number;
}

export interface ApiCreateCandidateRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  experience?: string;
  currentCompany?: string;
  currentPosition?: string;
  skills?: string[];
  notes?: string;
}

export interface ApiCreateCandidateResponse {
  candidate: ApiCandidate;
}

export interface ApiCreateInterviewRequest {
  candidateId: string;
  positionId: string;
  interviewerIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  round?: number;
  type?: string;
}

export interface ApiCreateInterviewResponse {
  interview: ApiInterview;
}

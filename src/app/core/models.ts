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

export interface CreateCandidateRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  experience: string;
  currentCompany: string;
  currentPosition: string;
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
  openings: number;
  closedAt?: string | null;
  closeReason?: string | null;
  createdAt?: string;
}

export interface PositionStats {
  applied: number;
  interviewing: number;
  hired: number;
  rejected: number;
  onHold: number;
  filled: number;
}

export interface ApiVacancy extends ApiPositionWithDepartment {
  creator?: ApiUser;
  stats?: PositionStats;
}

export interface ApiPositionsWithStatsResponse {
  positions: ApiVacancy[];
}

export interface ApiUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface ApiInterviewRound {
  id: string;
  interviewId: string;
  roundNumber: number;
  type: string | null;
  duration: number;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  status: string;
  decision?: string;
  decisionUpdatedAt?: string | null;
  decisionUpdatedBy?: string | null;
  interviewerIds: string[];
  interviewers: ApiUser[];
  interviewFeedbacks?: FeedbackResponse[];
}

export interface ApiInterview {
  id: string;
  round: number;
  type: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  decision: string;
  decisionUpdatedAt?: string | null;
  decisionUpdatedBy?: string | null;
  candidateId: string;
  candidate: ApiCandidate;
  positionId: string;
  position: ApiPosition;
  createdBy: string;
  creator: ApiUser;
  interviewerIds: string[];
  interviewers: ApiUser[];
  rounds?: ApiInterviewRound[];
  interviewFeedbacks?: FeedbackResponse[];
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
    resumeMimeType?: string | null;
    resumeUrl?: string;
  };
}

export interface SubmitFeedbackRequest {
  interviewId: string;
  roundId?: string;
  rating: number;
  recommendation: 'Yes' | 'No' | 'Hold';
  positiveComments: string;
  negativeComments: string;
  additionalComments: string;
}

export interface FeedbackRoundRef {
  id: string;
  roundNumber: number;
  type: string | null;
  date: string | null;
}

export interface FeedbackResponse {
  id: string;
  interviewId: string;
  roundId?: string | null;
  candidateId: string;
  interviewerId: string;
  interviewer?: ApiUser;
  round?: FeedbackRoundRef;
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
  feedback: FeedbackResponse | FeedbackResponse[] | null;
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
  description: string | null;
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

export interface ApiUpdateCandidateRequest {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  experience?: string;
  currentCompany?: string;
  currentPosition?: string;
  skills?: string[];
  notes?: string;
}

export interface ApiUpdateCandidateResponse {
  candidate: ApiCandidate;
}

export interface ApiDeleteCandidateResponse {
  message: string;
}

export interface ApiCandidateDetail extends ApiCandidate {
  resumeUrl?: string;
  notes?: string;
  interviews?: ApiInterview[];
}

export interface ApiCandidateDetailResponse {
  candidate: ApiCandidateDetail;
}

export interface ApiCreateInterviewRound {
  interviewerIds: string[];
  type?: string;
  duration: number;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export interface ApiCreateInterviewRequest {
  candidateId: string;
  positionId: string;
  interviewerIds?: string[];
  date?: string;
  startTime?: string;
  endTime?: string;
  round?: number;
  type?: string;
  rounds?: ApiCreateInterviewRound[];
}

export interface ApiCreateInterviewResponse {
  interview: ApiInterview;
}

export interface ApiRoundsResponse {
  rounds: ApiInterviewRound[];
}

export interface ApiAddRoundsResponse {
  rounds: ApiInterviewRound[];
}

export interface ApiUpdateRoundScheduleResponse {
  round: ApiInterviewRound;
}

export interface ApiCancelRoundResponse {
  round: ApiInterviewRound;
}

export type InterviewDecision = 'pending' | 'hired' | 'rejected' | 'hold' | 'next_round';

export interface ApiUpdateDecisionRequest {
  decision: InterviewDecision;
}

export interface ApiUpdateDecisionResponse {
  interview: {
    id: string;
    status: string;
    decision: string;
    decisionUpdatedAt: string | null;
    decisionUpdatedBy: string | null;
  };
}

export interface ApiDepartmentsResponse {
  departments: ApiDepartment[];
}

export interface ApiCreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: 'admin' | 'interviewer';
  designation?: string;
  phone?: string;
}

export interface ApiCreateUserResponse {
  user: {
    id: string;
    employeeId: string;
    firstname: string;
    lastname: string;
    email: string;
    designation: string | null;
    phone: string | null;
    role: { id: string; name: string };
  };
}

export interface ApiCreatePositionRequest {
  title: string;
  departmentId: string;
  requiredSkills: string[];
  minimumExperience: number;
  maximumExperience?: number;
  description: string;
  status: string;
  openings?: number;
}

export interface ApiCreatePositionResponse {
  position: ApiPositionWithDepartment;
}

export interface ApiUpdatePositionRequest {
  status?: string;
  openings?: number;
  closeReason?: string;
  title?: string;
  departmentId?: string;
  requiredSkills?: string[];
  minimumExperience?: number;
  maximumExperience?: number;
  description?: string;
}

export interface ApiUpdatePositionResponse {
  position: ApiPositionWithDepartment;
}

export interface ApiPositionResponse {
  position: ApiVacancy;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: CurrentUser;
}

export type CandidateTier = 'TIER_1_TOP' | 'TIER_2_STRONG' | 'TIER_3_GOOD' | 'NEGLECTED';

export interface ProcessedResumeCandidateInfo {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  experience?: string;
  currentCompany?: string;
  currentPosition?: string;
  skills: string[];
  notes?: string;
}

export interface ProcessedResumeEvaluation {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  tier: CandidateTier;
  shortlisted: boolean;
}

export interface ProcessedResumeResult {
  filename: string;
  mimetype: string;
  candidateInfo: ProcessedResumeCandidateInfo;
  evaluation: ProcessedResumeEvaluation;
  candidateId?: string;
  candidateCode?: string;
  status: 'CREATED' | 'EXISTING' | 'NEGLECTED' | 'ERROR';
  errorMessage?: string;
}

export interface BatchMatchingResponse {
  position: {
    id: string;
    title: string;
    department?: string;
  };
  summary: {
    totalUploaded: number;
    totalShortlisted: number;
    totalNeglected: number;
    tier1Count: number; // >= 95%
    tier2Count: number; // 85% - 94%
    tier3Count: number; // 75% - 84%
  };
  results: ProcessedResumeResult[];
}


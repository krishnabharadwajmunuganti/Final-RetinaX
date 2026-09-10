export type Role = 'Doctor' | 'Healthcare Worker' | 'Patient';

export type RiskLevel = 'High Risk' | 'Referable' | 'Needs Review' | 'Low Risk' | 'All Patients' | 'Recent Screenings';

export type DRGrade = 'No DR' | 'Mild NPDR' | 'Moderate NPDR' | 'Severe NPDR' | 'Proliferative DR (PDR)' | 'Ungradeable' | string;

export type ImageQuality = 'Good' | 'Acceptable' | 'Poor' | 'Ungradeable';

export type ReviewStatus = 'Pending Review' | 'Reviewed' | 'Referred' | 'Follow-up Set' | 'Recapture Needed' | 'Rejected (Quality)';

export type ReferralStage = 
  | 'AI Screening' 
  | 'Doctor Review' 
  | 'Referral Issued' 
  | 'Patient Informed' 
  | 'Hospital Visit' 
  | 'Follow-up';

export interface DoctorUser {
  id: string; // e.g. DOC-9041
  name: string;
  role: 'Doctor';
  email: string;
  phone: string;
  hospital: string;
  specialization: string;
  regNumber: string;
  avatarInitials: string;
  stats: {
    reviewed: number;
    referred: number;
    totalSessions: number;
  };
}

export interface WorkerUser {
  id: string; // e.g. WRK-3082
  name: string;
  role: 'Healthcare Worker';
  email: string;
  phone: string;
  area: string;
  organization: string;
  avatarInitials: string;
  stats: {
    patientsRegistered: number;
    sessionsCompleted: number;
  };
}

export interface PatientUser {
  id: string; // e.g. RX-104582
  name: string;
  role: 'Patient';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  area: string;
  address?: string;
  diabetesType?: 'Type 1' | 'Type 2' | 'Gestational';
  durationYears?: number;
  medications?: string;
  notes?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  lastScreeningDate?: string;
  totalScreenings?: number;
  overallStatus?: 'Low Risk' | 'Referable' | 'High Risk' | 'Needs Review';
}

export type PatientProfile = PatientUser;

export interface ReferralItem {
  id: string;
  patientId: string;
  patientName: string;
  doctorName?: string;
  doctorId?: string;
  dateIssued: string;
  targetAppointmentDate: string;
  hospitalName: string;
  reason: string;
  urgency: 'Urgent' | 'Routine' | 'Standard';
  status: 'Referral Issued' | 'Appointment Booked' | 'Visit Completed' | 'Closed';
  timeline: {
    status: string;
    date: string;
    note: string;
  }[];
}

export interface AIModelReport {
  status?: string; // "active" | "rejected_poor_quality"
  iqa: {
    status: ImageQuality;
    score: number; // 0-100%
    sharpness: string;
    illumination: string;
    fieldOfView: string;
    feedback?: string;
    isAcceptable?: boolean;
  };
  drClassification: {
    grade: DRGrade;
    confidence: number;
    icdrScale: number; // 0-4 or -1 if ungradeable
    probabilities?: number[];
  };
  referableDR: {
    isReferable: boolean;
    confidence: number;
    criteria: string;
  };
  microaneurysms: {
    status?: 'active' | 'not_yet_implemented';
    detected: boolean | null;
    count?: number | null;
    quadrants?: string[];
    details: string;
  };
  hemorrhages: {
    status?: 'active' | 'not_yet_implemented';
    detected: boolean | null;
    type?: string | null;
    quadrants?: string[];
    details: string;
  };
  neovascularization?: {
    status?: 'active' | 'not_yet_implemented';
    detected: boolean | null;
    details: string;
  };
  exudates: {
    status?: 'active' | 'not_yet_implemented' | 'not_assessed';
    detected: boolean | null;
    pixelCount?: number;
    pattern?: string;
    macularInvolvement?: boolean;
    quadrants?: string[];
    details: string;
  };
  opticDisc: {
    status: 'Normal' | 'Abnormal' | 'Suspect' | 'Marginal Visibility' | 'not_assessed' | string;
    detected?: boolean | null;
    cupToDiscRatio?: number | null;
    marginClarity?: string;
    centerCoordinates?: [number, number] | null;
    discPixelArea?: number;
    details: string;
  };
  vesselAnalysis: {
    status: 'Normal' | 'Abnormal' | 'Abnormal Caliber' | 'not_assessed' | string;
    detected?: boolean | null;
    vesselDensity?: number;
    arteriovenousNicking?: boolean;
    tortuosity?: string;
    caliberRatio?: string;
    details: string;
  };
  gradCam?: {
    status?: 'active' | 'not_yet_implemented';
    available: boolean;
    overlayUrl?: string | null;
    details?: string;
  };
  clinicalSummary?: string;
  visualizations?: {
    original?: string | null;
    opticDisc?: string | null;
    vessels?: string | null;
    exudates?: string | null;
    microaneurysms?: string | null;
    hemorrhages?: string | null;
    gradCam?: string | null;
  };
}

export interface ScreeningSession {
  id: string; // e.g. SESS-2026-0891
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientArea: string;
  date: string;
  laterality: 'Right Eye (OD)' | 'Left Eye (OS)' | 'Both Eyes (OU)';
  riskLevel: 'High Risk' | 'Referable' | 'Needs Review' | 'Low Risk';
  imageQuality: ImageQuality;
  drGrade: DRGrade;
  isReferable: boolean;
  reviewStatus: ReviewStatus;
  workerId: string;
  workerName: string;
  originalImageUrl: string;
  aiReport: AIModelReport;
  doctorAssessment?: {
    doctorId: string;
    doctorName: string;
    decision: 'No immediate referral' | 'Follow-up required' | 'Refer to hospital' | 'Urgent referral';
    notes: string;
    followUpDate?: string;
    hospitalName?: string;
    submittedAt: string;
  };
}

export interface ReferralRecord {
  id: string;
  patientId: string;
  patientName: string;
  sessionId: string;
  dateInitiated: string;
  urgency: 'Urgent' | 'Standard' | 'Routine';
  currentStage: ReferralStage;
  targetHospital: string;
  specialty: string;
  notes: string;
  history: {
    stage: ReferralStage;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }[];
}

export interface NotificationItem {
  id: string;
  roleTarget: 'Doctor' | 'Healthcare Worker' | 'Patient' | 'All';
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'high_risk' | 'review_needed' | 'assessment_done' | 'referral_update' | 'followup';
  patientId?: string;
  sessionId?: string;
  referralId?: string;
}

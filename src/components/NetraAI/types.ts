export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isDemoMode?: boolean;
  isError?: boolean;
}

export interface ScreeningEyeContext {
  grade?: number | string;
  stageName?: string;
  confidence?: number;
  quality?: string;
  lesions?: string[];
  gradCamAvailable?: boolean;
}

export interface ScreeningContextData {
  patientId?: string;
  screeningId?: string;
  leftEye?: ScreeningEyeContext;
  rightEye?: ScreeningEyeContext;
  referralStatus?: string;
  doctorReviewStatus?: string;
  summary?: string;
}

export type NetraUserRole = 'HEALTH_WORKER' | 'DOCTOR' | 'ADMIN' | 'PATIENT';

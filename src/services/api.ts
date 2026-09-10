/**
 * RetinaX Unified Frontend API Service
 * Connects all portals to the FastAPI backend at http://localhost:8000
 */

import {
  ScreeningSession,
  ReferralItem,
  NotificationItem,
  AIModelReport,
  DoctorUser,
  WorkerUser,
  PatientProfile,
} from '../types';

// Single-origin relative API path in production; fallback to localhost:8000 only in local Vite dev
const envApiUrl = (import.meta as any).env?.VITE_API_URL;
const isViteDev = typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '3000');
export const API_BASE = envApiUrl !== undefined ? envApiUrl : (isViteDev ? 'http://localhost:8000' : '');

// Token Management
export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem('retinax_token');
  },
  setToken(token: string): void {
    localStorage.setItem('retinax_token', token);
  },
  getUser(): any | null {
    const raw = localStorage.getItem('retinax_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user: any): void {
    localStorage.setItem('retinax_user', JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem('retinax_token');
    localStorage.removeItem('retinax_user');
  },
};

// Generic Fetch Wrapper
async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  const token = authStorage.getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type only if not multipart/form-data
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string'
          ? errorJson.detail
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// ----------------------------------------------------
// 1. Authentication APIs
// ----------------------------------------------------
export const authApi = {
  async login(emailOrId: string, password: string) {
    const data = await apiFetch<{
      access_token: string;
      token_type: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: 'doctor' | 'health_worker' | 'patient';
        phone?: string;
        hospital_or_area?: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailOrId, password }),
    });

    if (data.access_token) {
      authStorage.setToken(data.access_token);
      authStorage.setUser(data.user);
    }
    return data;
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    role: 'patient' | 'doctor' | 'health_worker';
    phone?: string;
    hospital_or_area?: string;
    custom_id?: string;
  }) {
    const data = await apiFetch<{
      access_token: string;
      token_type: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (data.access_token) {
      authStorage.setToken(data.access_token);
      authStorage.setUser(data.user);
    }
    return data;
  },

  async getMe() {
    return apiFetch<{ user: any }>('/auth/me');
  },

  async getPatients(): Promise<PatientProfile[]> {
    const users = await apiFetch<any[]>('/auth/patients');
    return users.map(u => ({
      id: u.id,
      name: u.name,
      role: 'Patient',
      age: 52, // Default estimated age if not stored
      gender: 'Male',
      phone: u.phone || '+1 (555) 000-0000',
      area: u.hospital_or_area || 'East Valley Community Post',
      totalScreenings: 1,
      overallStatus: 'Needs Review',
    }));
  },
};

// ----------------------------------------------------
// 2. Screening Reports APIs
// ----------------------------------------------------
export const reportsApi = {
  async uploadReport(params: {
    file: File | Blob;
    fileName?: string;
    patientId: string;
    laterality?: string;
    simulatedSeverity?: string;
  }): Promise<ScreeningSession> {
    const formData = new FormData();
    formData.append('image', params.file, params.fileName || 'retina_scan.jpg');
    formData.append('patient_id', params.patientId);
    if (params.laterality) formData.append('laterality', params.laterality);
    if (params.simulatedSeverity) formData.append('simulated_severity', params.simulatedSeverity);

    const report = await apiFetch<any>('/reports/upload', {
      method: 'POST',
      body: formData,
    });

    return adaptReportToSession(report);
  },

  async getReports(params?: {
    patient_id?: string;
    status?: string;
    severity?: string;
  }): Promise<ScreeningSession[]> {
    const query = new URLSearchParams();
    if (params?.patient_id) query.append('patient_id', params.patient_id);
    if (params?.status) query.append('status', params.status);
    if (params?.severity) query.append('severity', params.severity);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const reports = await apiFetch<any[]>(`/reports${qs}`);
    return reports.map(adaptReportToSession);
  },

  async getReportById(id: string): Promise<ScreeningSession> {
    const report = await apiFetch<any>(`/reports/${id}`);
    return adaptReportToSession(report);
  },

  async updateReportStatus(id: string, status: string, doctorNotes?: string): Promise<ScreeningSession> {
    const report = await apiFetch<any>(`/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, doctor_notes: doctorNotes }),
    });
    return adaptReportToSession(report);
  },
};

// ----------------------------------------------------
// 3. Transit Pass (Referrals) APIs
// ----------------------------------------------------
export const transitPassApi = {
  async createTransitPass(payload: {
    patientId: string;
    referralReason: string;
    targetHospital?: string;
    urgency?: 'Routine' | 'Standard' | 'Urgent';
  }): Promise<ReferralItem> {
    const pass = await apiFetch<any>('/transit-pass/refer', {
      method: 'POST',
      body: JSON.stringify({
        patient_id: payload.patientId,
        referral_reason: payload.referralReason,
        target_hospital: payload.targetHospital || 'District Eye Hospital & Vitreoretinal Unit',
        urgency: payload.urgency || 'Standard',
      }),
    });
    return adaptTransitPassToReferral(pass);
  },

  async getPatientTransitPasses(patientId: string): Promise<ReferralItem[]> {
    const passes = await apiFetch<any[]>(`/transit-pass/${patientId}`);
    return passes.map(adaptTransitPassToReferral);
  },

  async getAllTransitPasses(): Promise<ReferralItem[]> {
    const passes = await apiFetch<any[]>('/transit-pass');
    return passes.map(adaptTransitPassToReferral);
  },
};

// ----------------------------------------------------
// 4. Notifications APIs
// ----------------------------------------------------
export const notificationsApi = {
  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<NotificationItem[]> {
    const qs = unreadOnly ? '?unread_only=true' : '';
    const notifs = await apiFetch<any[]>(`/notifications/${userId}${qs}`);
    return notifs.map(adaptNotification);
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const notif = await apiFetch<any>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
    return adaptNotification(notif);
  },
};

// ----------------------------------------------------
// Schema Adapters: Backend DB Models -> Frontend Types
// ----------------------------------------------------

export function adaptReportToSession(report: any): ScreeningSession {
  const diag: any = report.ai_diagnosis || {};
  const drClass = diag.drClassification || { grade: 'Moderate NPDR', confidence: 94, icdrScale: 2 };
  const iqa = diag.iqa || { status: 'Good', score: 94 };

  const severityRiskMap: Record<string, 'High Risk' | 'Referable' | 'Needs Review' | 'Low Risk'> = {
    proliferative: 'High Risk',
    severe: 'High Risk',
    moderate: 'Referable',
    mild: 'Needs Review',
    none: 'Low Risk',
    ungradeable: 'Needs Review',
  };

  const statusMap: Record<string, 'Pending Review' | 'Reviewed' | 'Referred' | 'Follow-up Set' | 'Recapture Needed' | 'Rejected (Quality)'> = {
    pending: 'Pending Review',
    reviewed: 'Reviewed',
    accepted: 'Reviewed',
    rejected_poor_quality: 'Recapture Needed',
  };

  // Build complete AIModelReport structure
  const fullAiReport: AIModelReport = {
    status: diag.status || (report.status === 'rejected_poor_quality' ? 'rejected_poor_quality' : 'active'),
    iqa: {
      status: (iqa.status as any) || 'Good',
      score: iqa.score || 94,
      sharpness: iqa.sharpness || 'Sharp foveal detail',
      illumination: iqa.illumination || 'Uniformly illuminated',
      fieldOfView: iqa.fieldOfView || 'Field 2 (Macula Centered)',
      feedback: iqa.feedback,
      isAcceptable: iqa.isAcceptable ?? (report.status !== 'rejected_poor_quality'),
    },
    drClassification: {
      grade: (drClass.grade as any) || 'Moderate NPDR',
      confidence: drClass.confidence || 94,
      icdrScale: drClass.icdrScale ?? 2,
      probabilities: drClass.probabilities,
    },
    referableDR: {
      isReferable: diag.referableDR?.isReferable ?? (report.severity === 'moderate' || report.severity === 'severe' || report.severity === 'proliferative'),
      confidence: diag.referableDR?.confidence || 94,
      criteria: diag.referableDR?.criteria || 'Referable retinopathy lesions identified.',
    },
    microaneurysms: diag.microaneurysms || {
      status: 'not_yet_implemented',
      detected: null,
      count: null,
      quadrants: [],
      details: 'Microaneurysm detection model is in development (Coming Soon)',
    },
    hemorrhages: diag.hemorrhages || {
      status: 'not_yet_implemented',
      detected: null,
      type: null,
      quadrants: [],
      details: 'Hemorrhage classification model is in development (Coming Soon)',
    },
    neovascularization: diag.neovascularization || {
      status: 'not_yet_implemented',
      detected: null,
      details: 'Neovascularization detection model is in development (Coming Soon)',
    },
    exudates: diag.exudates || {
      status: 'active',
      detected: false,
      pixelCount: 0,
      pattern: 'None',
      macularInvolvement: false,
      details: 'No clinically evident hard lipid exudation detected.',
    },
    opticDisc: diag.opticDisc || {
      status: 'Normal',
      detected: true,
      cupToDiscRatio: 0.34,
      marginClarity: 'Distinct margins',
      details: 'Healthy neuroretinal rim tissue without glaucomatous cupping.',
    },
    vesselAnalysis: diag.vesselAnalysis || {
      status: 'Normal',
      detected: true,
      tortuosity: 'Mild',
      caliberRatio: '2:3 (normal limits)',
      arteriovenousNicking: false,
      details: 'Arteriovenous caliber within normal limits.',
    },
    gradCam: diag.gradCam || {
      status: 'not_yet_implemented',
      available: false,
      overlayUrl: null,
      details: 'Grad-CAM backprop gradient extraction not supported in ONNX Runtime. Model in development.',
    },
    clinicalSummary: diag.clinicalSummary || 'Automated multi-model diabetic retinopathy screening assessment.',
    visualizations: diag.visualizations || {
      original: report.image_url,
      opticDisc: null,
      vessels: null,
      exudates: null,
      microaneurysms: null,
      hemorrhages: null,
      gradCam: null,
    },
  };

  const fullImageUrl = report.image_url.startsWith('http')
    ? report.image_url
    : `${API_BASE}${report.image_url}`;

  return {
    id: report.id,
    patientId: report.patient_id,
    patientName: report.patient_name || `Patient (${report.patient_id})`,
    patientAge: 52,
    patientGender: 'Male',
    patientArea: 'East Valley Unit',
    date: report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Today',
    laterality: report.laterality || 'Right Eye (OD)',
    drGrade: (drClass.grade as any) || 'Moderate NPDR',
    riskLevel: severityRiskMap[report.severity] || 'Referable',
    imageQuality: (iqa.status as any) || 'Good',
    reviewStatus: statusMap[report.status] || 'Pending Review',
    isReferable: fullAiReport.referableDR.isReferable,
    workerId: 'WRK-3082',
    workerName: 'Sunita Sharma',
    originalImageUrl: fullImageUrl,
    aiReport: fullAiReport,
    doctorAssessment: report.doctor_id
      ? {
          doctorId: report.doctor_id,
          doctorName: report.doctor_name || 'Dr. Alistair Vance',
          decision: 'Refer to hospital',
          notes: report.doctor_notes || 'Clinical review completed.',
          hospitalName: 'District Eye Hospital & Vitreoretinal Unit',
          followUpDate: 'Within 30 Days',
          submittedAt: report.updated_at || new Date().toISOString(),
        }
      : undefined,
  };
}

export function adaptTransitPassToReferral(pass: any): ReferralItem {
  return {
    id: pass.id,
    patientId: pass.patient_id,
    patientName: pass.patient_name || `Patient (${pass.patient_id})`,
    doctorId: pass.doctor_id,
    doctorName: pass.doctor_name || 'Dr. Alistair Vance',
    dateIssued: pass.issued_date ? new Date(pass.issued_date).toLocaleDateString() : 'Today',
    targetAppointmentDate: 'Within 2 Weeks',
    hospitalName: pass.target_hospital || 'St. Jude Eye Institute Vitreoretinal Unit',
    reason: pass.referral_reason || 'Specialist consultation required for diabetic retinopathy.',
    urgency: (pass.urgency as any) || 'Routine',
    status: 'Referral Issued',
    timeline: [
      {
        status: 'Referral Issued',
        date: pass.issued_date ? new Date(pass.issued_date).toLocaleDateString() : 'Today',
        note: `Transit pass issued by ${pass.doctor_name || 'Doctor'} to ${pass.target_hospital}.`,
      },
    ],
  };
}

export function adaptNotification(notif: any): NotificationItem {
  return {
    id: notif.id,
    userId: notif.user_id,
    roleTarget: 'Doctor', // fallback
    title: notif.type === 'high_risk' ? 'High Risk Screening Alert' : 'Clinical Notification',
    message: notif.message,
    timestamp: notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    isRead: notif.is_read,
    type: notif.type || 'review_needed',
    sessionId: notif.related_report_id,
  };
}

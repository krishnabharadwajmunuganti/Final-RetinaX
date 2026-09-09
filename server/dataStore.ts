/**
 * RetinaX Server-side Clinical & Operational In-Memory Data Store
 * Serves real persistent dynamic data across Doctor, Healthcare Worker, and Patient portals.
 */

import {
  DoctorUser,
  WorkerUser,
  PatientProfile,
  ScreeningSession,
  ReferralItem,
  NotificationItem,
} from '../src/types';
import {
  initialDoctor,
  initialWorker,
  initialPatients,
  initialScreenings,
  initialReferrals,
} from '../src/mockData';

// Initial notifications store
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-doc-1',
    title: 'High Priority Screening Uploaded',
    message: 'Severe NPDR suspected for Eleanor Vance (RX-104582) at East Valley Health Unit.',
    timestamp: 'Today, 10:14 AM',
    isRead: false,
    type: 'high_risk',
    roleTarget: 'Doctor',
    patientId: 'RX-104582',
    sessionId: 'SESS-2026-0891',
  },
  {
    id: 'notif-doc-2',
    title: 'New Screening to Review',
    message: 'Moderate NPDR with exudates detected for Marcus Brody (RX-104583) awaiting clinical grading.',
    timestamp: 'Today, 09:30 AM',
    isRead: false,
    type: 'review_needed',
    roleTarget: 'Doctor',
    patientId: 'RX-104583',
    sessionId: 'SESS-2026-0888',
  },
  {
    id: 'notif-doc-3',
    title: 'Pending Optical Assessment',
    message: 'Sunita Patel (RX-104584) bilateral session ready for review and referral sign-off.',
    timestamp: 'Yesterday, 04:15 PM',
    isRead: true,
    type: 'review_needed',
    roleTarget: 'Doctor',
    patientId: 'RX-104584',
    sessionId: 'SESS-2026-0879',
  },
  {
    id: 'notif-wrk-1',
    title: 'Hospital Referral Needed',
    message: 'Dr. Alistair Vance issued referral for Eleanor Vance (RX-104582) to St. Jude Eye Institute Vitreoretinal Unit.',
    timestamp: 'Today, 11:20 AM',
    isRead: false,
    type: 'referral_update',
    roleTarget: 'Healthcare Worker',
    patientId: 'RX-104582',
    referralId: 'REF-2026-0042',
  },
  {
    id: 'notif-wrk-2',
    title: 'Assessment Completed',
    message: 'Specialist grading confirmed for David Miller (RX-104585) - Annual checkup scheduled.',
    timestamp: 'Today, 09:45 AM',
    isRead: false,
    type: 'assessment_done',
    roleTarget: 'Healthcare Worker',
    patientId: 'RX-104585',
    sessionId: 'SESS-2026-0870',
  },
  {
    id: 'notif-wrk-3',
    title: 'Follow-up Screening Due',
    message: 'Amina Yusuf (RX-104586) is due for post-OCT appointment check at health post.',
    timestamp: 'Yesterday, 02:00 PM',
    isRead: true,
    type: 'followup',
    roleTarget: 'Healthcare Worker',
    patientId: 'RX-104586',
  },
  {
    id: 'notif-pat-1',
    title: 'Screening Report Available',
    message: 'Your tele-retinopathy report reviewed by Dr. Alistair Vance is available in your records.',
    timestamp: 'Today, 10:14 AM',
    isRead: false,
    type: 'assessment_done',
    roleTarget: 'Patient',
    patientId: 'RX-104582',
    sessionId: 'SESS-2026-0891',
  },
  {
    id: 'notif-pat-2',
    title: 'Specialist Referral Documentation',
    message: 'Referral documentation issued for St. Jude Eye Institute Vitreoretinal Unit. Review directions in portal.',
    timestamp: 'Today, 09:30 AM',
    isRead: false,
    type: 'referral_update',
    roleTarget: 'Patient',
    patientId: 'RX-104582',
    referralId: 'REF-2026-0042',
  },
  {
    id: 'notif-pat-3',
    title: 'Annual Follow-up Reminder',
    message: 'Next routine dilated fundus examination recommended in 12 months.',
    timestamp: 'Yesterday, 04:15 PM',
    isRead: true,
    type: 'followup',
    roleTarget: 'Patient',
    patientId: 'RX-104585',
  },
];

// Live in-memory states
let doctorState: DoctorUser = { ...initialDoctor };
let workerState: WorkerUser = { ...initialWorker };
let patientsState: PatientProfile[] = [...initialPatients];
let sessionsState: ScreeningSession[] = [...initialScreenings];
let referralsState: ReferralItem[] = [...initialReferrals];
let notificationsState: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

export const dataStore = {
  getBootstrap() {
    return {
      doctor: doctorState,
      worker: workerState,
      patients: patientsState,
      sessions: sessionsState,
      referrals: referralsState,
      notifications: notificationsState,
    };
  },

  // Patients
  getPatients() {
    return patientsState;
  },

  getPatientById(id: string) {
    return patientsState.find((p) => p.id === id);
  },

  createPatient(newPatient: PatientProfile) {
    patientsState = [newPatient, ...patientsState];
    // Update worker stats
    workerState = {
      ...workerState,
      stats: {
        ...workerState.stats,
        patientsRegistered: workerState.stats.patientsRegistered + 1,
      },
    };
    return newPatient;
  },

  updatePatient(id: string, updates: Partial<PatientProfile>) {
    patientsState = patientsState.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    return patientsState.find((p) => p.id === id);
  },

  // Screening Sessions
  getSessions() {
    return sessionsState;
  },

  getSessionById(id: string) {
    return sessionsState.find((s) => s.id === id);
  },

  createSession(newSession: ScreeningSession) {
    sessionsState = [newSession, ...sessionsState];

    // Update patient record
    const targetPatient = patientsState.find((p) => p.id === newSession.patientId);
    if (targetPatient) {
      patientsState = patientsState.map((p) =>
        p.id === newSession.patientId
          ? {
              ...p,
              lastScreeningDate: newSession.date,
              totalScreenings: (p.totalScreenings || 0) + 1,
              overallStatus: newSession.riskLevel,
            }
          : p
      );
    }

    // Update worker stats
    workerState = {
      ...workerState,
      stats: {
        ...workerState.stats,
        sessionsCompleted: workerState.stats.sessionsCompleted + 1,
      },
    };

    // Update doctor stats totalSessions
    doctorState = {
      ...doctorState,
      stats: {
        ...doctorState.stats,
        totalSessions: doctorState.stats.totalSessions + 1,
      },
    };

    // Automatically create a notification for doctor if High Risk or Needs Review
    if (newSession.riskLevel === 'High Risk') {
      const docNotif: NotificationItem = {
        id: `notif-doc-${Date.now()}`,
        title: 'URGENT: High Risk Screening Uploaded',
        message: `${newSession.drGrade} detected for ${newSession.patientName} (${newSession.patientId}) at ${newSession.patientArea}. Immediate review advised.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'high_risk',
        roleTarget: 'Doctor',
        patientId: newSession.patientId,
        sessionId: newSession.id,
      };
      notificationsState = [docNotif, ...notificationsState];
    } else {
      const docNotif: NotificationItem = {
        id: `notif-doc-${Date.now()}`,
        title: 'New Screening Session in Queue',
        message: `New scan for ${newSession.patientName} (${newSession.patientId}) submitted from field. Ready for specialist grading.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'review_needed',
        roleTarget: 'Doctor',
        patientId: newSession.patientId,
        sessionId: newSession.id,
      };
      notificationsState = [docNotif, ...notificationsState];
    }

    return newSession;
  },

  submitDoctorAssessment(
    sessionId: string,
    data: {
      decision: 'No immediate referral' | 'Follow-up required' | 'Refer to hospital' | 'Urgent referral';
      notes: string;
      hospitalName?: string;
      followUpDate?: string;
      doctorName: string;
      doctorId: string;
    }
  ) {
    const targetSession = sessionsState.find((s) => s.id === sessionId);
    if (!targetSession) return null;

    sessionsState = sessionsState.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          reviewStatus: 'Reviewed' as const,
          doctorAssessment: {
            doctorId: data.doctorId,
            doctorName: data.doctorName,
            decision: data.decision,
            notes: data.notes,
            hospitalName: data.hospitalName,
            followUpDate: data.followUpDate,
            submittedAt: 'Today, Just now',
          },
        };
      }
      return s;
    });

    // Update doctor stats
    const isReferred = data.decision === 'Refer to hospital' || data.decision === 'Urgent referral';
    doctorState = {
      ...doctorState,
      stats: {
        ...doctorState.stats,
        reviewed: doctorState.stats.reviewed + 1,
        referred: isReferred ? doctorState.stats.referred + 1 : doctorState.stats.referred,
      },
    };

    // If referral required, auto-create ReferralItem and notification
    let generatedReferral: ReferralItem | null = null;
    if (isReferred) {
      generatedReferral = {
        id: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: targetSession.patientId,
        patientName: targetSession.patientName,
        doctorName: data.doctorName,
        doctorId: data.doctorId,
        dateIssued: 'Today, Just now',
        targetAppointmentDate: data.followUpDate || 'Within 2 Weeks',
        hospitalName: data.hospitalName || 'District Eye Hospital & Vitreoretinal Unit',
        reason: data.notes.slice(0, 100) + '...',
        urgency: data.decision === 'Urgent referral' ? 'Urgent' : 'Routine',
        status: 'Referral Issued',
        timeline: [
          {
            status: 'Referral Issued',
            date: 'Today',
            note: `Referral issued by ${data.doctorName}. Priority: ${data.decision}.`,
          },
        ],
      };
      referralsState = [generatedReferral, ...referralsState];

      // Worker notification for referral
      const wrkNotif: NotificationItem = {
        id: `notif-wrk-${Date.now()}`,
        title: 'New Hospital Referral to Coordinate',
        message: `${data.doctorName} referred ${targetSession.patientName} (${targetSession.patientId}) to ${data.hospitalName || 'Eye Hospital'}.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'referral_update',
        roleTarget: 'Healthcare Worker',
        patientId: targetSession.patientId,
        referralId: generatedReferral.id,
      };
      notificationsState = [wrkNotif, ...notificationsState];

      // Patient notification for referral
      const patNotif: NotificationItem = {
        id: `notif-pat-${Date.now()}`,
        title: 'Hospital Referral Recommendation',
        message: `Doctor recommended specialist consultation at ${data.hospitalName || 'Specialist Eye Hospital'}. Check your portal for visit guidelines.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'referral_update',
        roleTarget: 'Patient',
        patientId: targetSession.patientId,
        referralId: generatedReferral.id,
      };
      notificationsState = [patNotif, ...notificationsState];
    } else {
      // Patient notification: report available
      const patNotif: NotificationItem = {
        id: `notif-pat-${Date.now()}`,
        title: 'Doctor Assessment Completed',
        message: `Your retinal screening results have been reviewed and signed by ${data.doctorName}.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'assessment_done',
        roleTarget: 'Patient',
        patientId: targetSession.patientId,
        sessionId: targetSession.id,
      };
      notificationsState = [patNotif, ...notificationsState];
    }

    return {
      session: sessionsState.find((s) => s.id === sessionId),
      referral: generatedReferral,
    };
  },

  // Referrals
  getReferrals() {
    return referralsState;
  },

  createReferral(newReferral: ReferralItem) {
    referralsState = [newReferral, ...referralsState];
    return newReferral;
  },

  updateReferral(
    id: string,
    updates: {
      status?: 'Referral Issued' | 'Appointment Booked' | 'Visit Completed' | 'Closed';
      note?: string;
    }
  ) {
    referralsState = referralsState.map((ref) => {
      if (ref.id === id) {
        const newStatus = updates.status || ref.status;
        const newTimeline = updates.note
          ? [
              ...ref.timeline,
              {
                status: newStatus,
                date: 'Today',
                note: updates.note,
              },
            ]
          : ref.timeline;
        return {
          ...ref,
          status: newStatus,
          timeline: newTimeline,
        };
      }
      return ref;
    });
    return referralsState.find((r) => r.id === id);
  },

  // Notifications
  getNotifications() {
    return notificationsState;
  },

  markAllNotificationsRead(roleTarget?: string) {
    notificationsState = notificationsState.map((n) => {
      if (!roleTarget || n.roleTarget === roleTarget || n.roleTarget === 'All') {
        return { ...n, isRead: true };
      }
      return n;
    });
    return notificationsState;
  },

  toggleNotification(id: string) {
    notificationsState = notificationsState.map((n) =>
      n.id === id ? { ...n, isRead: !n.isRead } : n
    );
    return notificationsState.find((n) => n.id === id);
  },

  createNotification(newNotif: NotificationItem) {
    notificationsState = [newNotif, ...notificationsState];
    return newNotif;
  },

  // Doctor & Worker Profiles
  getDoctor() {
    return doctorState;
  },

  updateDoctor(updates: Partial<DoctorUser>) {
    doctorState = { ...doctorState, ...updates };
    return doctorState;
  },

  getWorker() {
    return workerState;
  },

  updateWorker(updates: Partial<WorkerUser>) {
    workerState = { ...workerState, ...updates };
    return workerState;
  },
};

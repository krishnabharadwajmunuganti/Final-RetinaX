import React, { useState, useEffect } from 'react';
import {
  Role,
  DoctorUser,
  WorkerUser,
  PatientProfile,
  ScreeningSession,
  ReferralItem,
  RiskLevel,
  NotificationItem,
} from './types';
import {
  initialDoctor,
  initialWorker,
  initialPatients,
  initialScreenings,
  initialReferrals,
} from './mockData';
import { Header } from './components/common/Header';
import { NetraAIButton, NetraAIPanel, ScreeningContextData } from './components/NetraAI';
import { EditProfileModal } from './components/common/EditProfileModal';
import { NotificationsPage } from './components/common/NotificationsPage';
import { RoleProfilePage } from './components/common/RoleProfilePage';

// Landing and Auth
import { LandingPage } from './components/landing/LandingPage';
import { DoctorLoginPage } from './components/auth/DoctorLoginPage';
import { WorkerLoginPage } from './components/auth/WorkerLoginPage';
import { PatientLoginPage } from './components/auth/PatientLoginPage';
import { DoctorRegisterPage } from './components/auth/DoctorRegisterPage';
import { WorkerRegisterPage } from './components/auth/WorkerRegisterPage';

// Doctor Pages
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { DoctorPatientList } from './components/doctor/DoctorPatientList';
import { DoctorPatientDetails } from './components/doctor/DoctorPatientDetails';
import { DoctorAnalytics } from './components/doctor/DoctorAnalytics';

// Worker Pages
import { WorkerHome } from './components/worker/WorkerHome';
import { WorkerRegisterPatient } from './components/worker/WorkerRegisterPatient';
import { WorkerExistingPatient } from './components/worker/WorkerExistingPatient';
import { WorkerScreeningFlow } from './components/worker/WorkerScreeningFlow';
import { WorkerReferrals } from './components/worker/WorkerReferrals';
import { WorkerPatientList } from './components/worker/WorkerPatientList';

// Patient Portal
import { PatientPortal } from './components/patient/PatientPortal';

export default function App() {
  // Authentication & Navigation State
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [authView, setAuthView] = useState<
    | 'landing'
    | 'login_doctor'
    | 'login_worker'
    | 'login_patient'
    | 'register_doctor'
    | 'register_worker'
    | 'authenticated'
  >('landing');

  // Active Tab per role
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Domain Data State (dynamically fetched from backend /api/bootstrap)
  const [doctor, setDoctor] = useState<DoctorUser>(initialDoctor);
  const [worker, setWorker] = useState<WorkerUser>(initialWorker);
  const [patients, setPatients] = useState<PatientProfile[]>(initialPatients);
  const [sessions, setSessions] = useState<ScreeningSession[]>(initialScreenings);
  const [referrals, setReferrals] = useState<ReferralItem[]>(initialReferrals);

  // Active screening patient ID (when launching from New or Existing Patient)
  const [activeScreeningPatientId, setActiveScreeningPatientId] = useState<string | undefined>(
    undefined
  );

  // Active session for Doctor or Worker detail inspection
  const [selectedSession, setSelectedSession] = useState<ScreeningSession | null>(
    initialScreenings[0]
  );
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null);

  // Active Patient for Patient Portal login
  const [activePatient, setActivePatient] = useState<PatientProfile>(initialPatients[0]);

  // Modals & Notifications
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Netra AI State
  const [isNetraOpen, setIsNetraOpen] = useState(false);
  const [netraContext, setNetraContext] = useState<ScreeningContextData | null>(null);
  const [netraPendingPrompt, setNetraPendingPrompt] = useState<string | null>(null);

  // Global listener for "open-netra-ai" custom event
  useEffect(() => {
    const handleOpenNetra = (e: Event) => {
      const customEvent = e as CustomEvent<{ context?: ScreeningContextData; prompt?: string }>;
      if (customEvent.detail) {
        if (customEvent.detail.context) {
          setNetraContext(customEvent.detail.context);
        }
        if (customEvent.detail.prompt) {
          setNetraPendingPrompt(customEvent.detail.prompt);
        }
      }
      setIsNetraOpen(true);
    };

    window.addEventListener('open-netra-ai', handleOpenNetra);
    return () => {
      window.removeEventListener('open-netra-ai', handleOpenNetra);
    };
  }, []);

  // Real Dynamic Data Bootstrap from Backend API
  useEffect(() => {
    fetch('/api/bootstrap')
      .then((res) => {
        if (!res.ok) throw new Error('API bootstrap failed');
        return res.json();
      })
      .then((data) => {
        if (data.doctor) setDoctor(data.doctor);
        if (data.worker) setWorker(data.worker);
        if (data.patients && Array.isArray(data.patients)) {
          setPatients(data.patients);
          if (data.patients.length > 0) setActivePatient(data.patients[0]);
        }
        if (data.sessions && Array.isArray(data.sessions)) {
          setSessions(data.sessions);
          if (data.sessions.length > 0) setSelectedSession(data.sessions[0]);
        }
        if (data.referrals && Array.isArray(data.referrals)) {
          setReferrals(data.referrals);
        }
        if (data.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch((err) => {
        console.warn('Backend sync warning, fallback active:', err);
      });
  }, []);

  // Handlers for Login
  const handleLoginSuccess = (role: Role, id: string) => {
    setCurrentRole(role);
    setAuthView('authenticated');

    if (role === 'Doctor') {
      setActiveTab('dashboard');
    } else if (role === 'Healthcare Worker') {
      setActiveTab('home');
    } else if (role === 'Patient') {
      const matched = patients.find((p) => p.id === id) || patients[0];
      setActivePatient(matched);
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setAuthView('landing');
    setSelectedSession(null);
  };

  // Switch Role from header chip (for easy testing between Doctor, Worker, Patient)
  const handleSwitchRole = (newRole: Role) => {
    setCurrentRole(newRole);
    if (newRole === 'Doctor') {
      setActiveTab('dashboard');
    } else if (newRole === 'Healthcare Worker') {
      setActiveTab('home');
    } else if (newRole === 'Patient') {
      setActiveTab('home');
    }
  };

  // Clinical Assessment Submission by Doctor
  const handleSubmitAssessment = async (
    sessionId: string,
    decision: 'No immediate referral' | 'Follow-up required' | 'Refer to hospital' | 'Urgent referral',
    notes: string,
    hospitalName?: string,
    followUpDate?: string
  ) => {
    // 1. Send assessment to backend API
    try {
      const res = await fetch(`/api/sessions/${sessionId}/assessment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          notes,
          hospitalName,
          followUpDate,
          doctorName: doctor.name,
          doctorId: doctor.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setSessions((prev) =>
            prev.map((s) => (s.id === sessionId ? data.session : s))
          );
        }
        if (data.referral) {
          setReferrals((prev) => [data.referral, ...prev.filter((r) => r.id !== data.referral.id)]);
        }
      }
    } catch (err) {
      console.error('Failed to submit assessment to backend API:', err);
    }

    const updatedSessions = sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          reviewStatus: 'Reviewed' as const,
          doctorAssessment: {
            decision,
            notes,
            doctorName: doctor.name,
            doctorId: doctor.id,
            hospitalName,
            followUpDate,
            submittedAt: new Date().toISOString(),
          },
        };
      }
      return s;
    });

    setSessions(updatedSessions);

    // Update Doctor reviewed stat
    setDoctor((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        reviewed: prev.stats.reviewed + 1,
        referred:
          decision === 'Refer to hospital' || decision === 'Urgent referral'
            ? prev.stats.referred + 1
            : prev.stats.referred,
      },
    }));

    // If referred, create or update referral record and push notification
    if (decision === 'Refer to hospital' || decision === 'Urgent referral') {
      const targetSession = sessions.find((s) => s.id === sessionId);
      if (targetSession) {
        const newRef: ReferralItem = {
          id: `REF-${Math.floor(100 + Math.random() * 900)}`,
          patientId: targetSession.patientId,
          patientName: targetSession.patientName,
          doctorName: doctor.name,
          doctorId: doctor.id,
          dateIssued: 'Today',
          targetAppointmentDate: followUpDate || '2026-09-22',
          hospitalName: hospitalName || 'St. Jude Eye Institute Vitreoretinal Unit',
          reason: notes.slice(0, 80) + '...',
          urgency: decision === 'Urgent referral' ? 'Urgent' : 'Routine',
          status: 'Referral Issued',
          timeline: [
            {
              status: 'Referral Issued',
              date: 'Today',
              note: `Doctor referral generated by ${doctor.name}.`,
            },
          ],
        };
        setReferrals((prev) => [newRef, ...prev.filter((r) => r.id !== newRef.id)]);

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: `Referral Issued for ${targetSession.patientName}`,
          message: `Referral issued to ${newRef.hospitalName}. Urgency: ${newRef.urgency}.`,
          timestamp: 'Just now',
          isRead: false,
          type: decision === 'Urgent referral' ? 'high_risk' : 'referral_update',
          roleTarget: 'Healthcare Worker',
          patientId: targetSession.patientId,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    }
  };

  // Patient Registration by Worker
  const handleRegisterPatientComplete = async (
    newPatient: PatientProfile,
    startScreeningImmediately: boolean
  ) => {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });
      if (res.ok) {
        const saved = await res.json();
        setPatients((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
      } else {
        setPatients((prev) => [newPatient, ...prev]);
      }
    } catch {
      setPatients((prev) => [newPatient, ...prev]);
    }

    setWorker((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        patientsRegistered: prev.stats.patientsRegistered + 1,
      },
    }));

    if (startScreeningImmediately) {
      setActiveScreeningPatientId(newPatient.id);
      setActiveTab('screen');
    } else {
      setActiveTab('home');
    }
  };

  // Screening Session Completion by Worker
  const handleCompleteScreening = async (newSession: ScreeningSession) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      if (res.ok) {
        const saved = await res.json();
        setSessions((prev) => [saved, ...prev.filter((s) => s.id !== saved.id)]);
      } else {
        setSessions((prev) => [newSession, ...prev]);
      }
    } catch {
      setSessions((prev) => [newSession, ...prev]);
    }

    setWorker((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        sessionsCompleted: prev.stats.sessionsCompleted + 1,
      },
    }));

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Screening: ${newSession.patientName}`,
      message: `Completed by ${worker.name} (${newSession.laterality} • ${newSession.drGrade}). Queued for doctor review.`,
      timestamp: 'Just now',
      isRead: false,
      type: newSession.riskLevel === 'High Risk' ? 'high_risk' : 'review_needed',
      roleTarget: 'Doctor',
      patientId: newSession.patientId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Return to Existing Patient records
    setActiveTab('existing-patient');
  };

  // Referral Update by Worker
  const handleUpdateReferral = async (updated: ReferralItem) => {
    try {
      await fetch(`/api/referrals/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updated.status,
          note: updated.timeline[updated.timeline.length - 1]?.note,
        }),
      });
    } catch (err) {
      console.error('Failed to persist referral update:', err);
    }

    setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Referral Stage Updated: ${updated.patientName}`,
      message: `Stage updated to "${updated.status}" by community team.`,
      timestamp: 'Just now',
      isRead: false,
      type: 'referral_update',
      roleTarget: 'Doctor',
      patientId: updated.patientId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Notification full-row click navigation handler
  const handleNotificationClick = (item: NotificationItem) => {
    // 1. Mark as read immediately on frontend and backend
    fetch(`/api/notifications/${item.id}/toggle`, { method: 'POST' }).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    // 2. Navigate to exact target record
    if (currentRole === 'Doctor') {
      if (item.sessionId) {
        const sess = sessions.find((s) => s.id === item.sessionId);
        if (sess) {
          setSelectedSession(sess);
          setActiveTab('patient_detail');
          return;
        }
      }
      if (item.patientId) {
        const sess = sessions.find((s) => s.patientId === item.patientId);
        if (sess) {
          setSelectedSession(sess);
          setActiveTab('patient_detail');
          return;
        }
      }
      if (item.type === 'referral_update' || item.referralId) {
        setActiveTab('referrals');
        return;
      }
      setActiveTab('patients');
    } else if (currentRole === 'Healthcare Worker') {
      if (item.type === 'referral_update' || item.referralId) {
        setActiveTab('referrals');
        return;
      }
      if (item.type === 'high_risk' && item.title.toLowerCase().includes('retake')) {
        if (item.patientId) setActiveScreeningPatientId(item.patientId);
        setActiveTab('screen');
        return;
      }
      if (item.type === 'followup') {
        setActiveTab('existing-patient');
        return;
      }
      if (item.sessionId) {
        const sess = sessions.find((s) => s.id === item.sessionId);
        if (sess) {
          setSelectedSession(sess);
          setActiveTab('patient_detail');
          return;
        }
      }
      if (item.patientId) {
        const sess = sessions.find((s) => s.patientId === item.patientId);
        if (sess) {
          setSelectedSession(sess);
          setActiveTab('patient_detail');
          return;
        }
      }
      setActiveTab('existing-patient');
    } else if (currentRole === 'Patient') {
      setActiveTab('history');
    }
  };

  // Edit Profile Save
  const handleSaveProfile = (updated: {
    name: string;
    email: string;
    phone: string;
    organizationOrHospital: string;
    areaOrSpecialization: string;
  }) => {
    if (currentRole === 'Doctor') {
      const docUpdates = {
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        hospital: updated.organizationOrHospital,
        specialization: updated.areaOrSpecialization,
      };
      fetch('/api/doctor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docUpdates),
      }).catch(() => {});
      setDoctor((prev) => ({
        ...prev,
        ...docUpdates,
      }));
    } else if (currentRole === 'Healthcare Worker') {
      const wrkUpdates = {
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        organization: updated.organizationOrHospital,
        area: updated.areaOrSpecialization,
      };
      fetch('/api/worker', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wrkUpdates),
      }).catch(() => {});
      setWorker((prev) => ({
        ...prev,
        ...wrkUpdates,
      }));
    } else if (currentRole === 'Patient') {
      setActivePatient((prev) => ({
        ...prev,
        name: updated.name,
        phone: updated.phone,
        area: updated.organizationOrHospital,
      }));
    }
  };

  // Netra AI Drawer Render Helper
  const renderNetraAI = () => (
    <>
      <NetraAIButton
        isOpen={isNetraOpen}
        onClick={() => setIsNetraOpen(!isNetraOpen)}
        hasActiveContext={Boolean(netraContext)}
      />
      <NetraAIPanel
        isOpen={isNetraOpen}
        onClose={() => setIsNetraOpen(false)}
        userRole={currentRole}
        screeningContext={netraContext}
        onClearContext={() => setNetraContext(null)}
        pendingInitialPrompt={netraPendingPrompt}
        onClearPendingPrompt={() => setNetraPendingPrompt(null)}
      />
    </>
  );

  // Unauthenticated Views Routing
  if (authView === 'landing') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-gray-900 selection:bg-teal-100 selection:text-teal-900">
        <LandingPage
          onSelectRole={(role) => {
            if (role === 'Doctor') setAuthView('login_doctor');
            else if (role === 'Healthcare Worker') setAuthView('login_worker');
            else if (role === 'Patient') setAuthView('login_patient');
          }}
          onSelectRoleLogin={(role) => {
            if (role === 'Doctor') setAuthView('login_doctor');
            else if (role === 'Healthcare Worker') setAuthView('login_worker');
            else if (role === 'Patient') setAuthView('login_patient');
          }}
          onQuickDemoLogin={(role, id) => {
            handleLoginSuccess(role, id);
          }}
        />
        {renderNetraAI()}
      </div>
    );
  }

  if (authView === 'login_doctor') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-gray-900">
        <DoctorLoginPage
          onBack={() => setAuthView('landing')}
          onBackToLanding={() => setAuthView('landing')}
          onLoginSuccess={(id) => handleLoginSuccess('Doctor', id)}
          onNavigateRegister={() => setAuthView('register_doctor')}
        />
        {renderNetraAI()}
      </div>
    );
  }

  if (authView === 'login_worker') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-gray-900">
        <WorkerLoginPage
          onBack={() => setAuthView('landing')}
          onBackToLanding={() => setAuthView('landing')}
          onLoginSuccess={(id) => handleLoginSuccess('Healthcare Worker', id)}
          onNavigateRegister={() => setAuthView('register_worker')}
        />
        {renderNetraAI()}
      </div>
    );
  }

  if (authView === 'login_patient') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-gray-900">
        <PatientLoginPage
          onBack={() => setAuthView('landing')}
          onBackToLanding={() => setAuthView('landing')}
          onLoginSuccess={(id) => handleLoginSuccess('Patient', id)}
        />
        {renderNetraAI()}
      </div>
    );
  }

  if (authView === 'register_doctor') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-gray-900">
        <DoctorRegisterPage
          onBack={() => setAuthView('login_doctor')}
          onBackToLogin={() => setAuthView('login_doctor')}
          onRegisterSuccess={(registeredDoctor) => {
            setDoctor(registeredDoctor);
            handleLoginSuccess('Doctor', registeredDoctor.id);
          }}
        />
        {renderNetraAI()}
      </div>
    );
  }

  if (authView === 'register_worker') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-gray-900">
        <WorkerRegisterPage
          onBack={() => setAuthView('login_worker')}
          onBackToLogin={() => setAuthView('login_worker')}
          onRegisterSuccess={(registeredWorker) => {
            setWorker(registeredWorker);
            handleLoginSuccess('Healthcare Worker', registeredWorker.id);
          }}
        />
        {renderNetraAI()}
      </div>
    );
  }

  // ================= AUTHENTICATED SYSTEM =================
  if (!currentRole) return null;

  const userProfile =
    currentRole === 'Doctor'
      ? {
          name: doctor.name,
          role: 'Doctor' as Role,
          organization: doctor.hospital,
          avatarInitials: doctor.name.split(' ').map((n) => n[0]).join('').slice(0, 2),
          id: doctor.id,
        }
      : currentRole === 'Healthcare Worker'
      ? {
          name: worker.name,
          role: 'Healthcare Worker' as Role,
          organization: worker.organization,
          avatarInitials: worker.name.split(' ').map((n) => n[0]).join('').slice(0, 2),
          id: worker.id,
        }
      : {
          name: activePatient.name,
          role: 'Patient' as Role,
          organization: activePatient.area,
          avatarInitials: activePatient.name.split(' ').map((n) => n[0]).join('').slice(0, 2),
          id: activePatient.id,
        };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-gray-900 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      <div className="w-full">
        {/* Universal RetinaX Top Header */}
        <Header
          currentRole={currentRole}
          activeTab={activeTab}
          userProfile={{
            name: userProfile.name,
            detail: userProfile.organization,
            initials: userProfile.avatarInitials,
          }}
          notifications={notifications.map((n) => n.title)}
          unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            setSelectedSession(null);
          }}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onOpenNotifications={() => setActiveTab('notifications')}
        />

        {/* Main Content Area */}
        <main className="w-full pb-16">
          {/* ================= UNIVERSAL NOTIFICATIONS TAB ================= */}
          {activeTab === 'notifications' && (
            <NotificationsPage
              currentRole={currentRole}
              notifications={notifications}
              onMarkAllAsRead={() => {
                fetch('/api/notifications/mark-all-read', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ roleTarget: currentRole || undefined }),
                }).catch(() => {});
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
              }}
              onToggleRead={(id) => {
                fetch(`/api/notifications/${id}/toggle`, { method: 'POST' }).catch(() => {});
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
                );
              }}
              onNavigateToNotificationTarget={handleNotificationClick}
              onBack={() => {
                if (currentRole === 'Doctor') setActiveTab('dashboard');
                else setActiveTab('home');
              }}
            />
          )}

          {/* ================= UNIVERSAL PROFILE TAB ================= */}
          {activeTab === 'profile' && (
            <RoleProfilePage
              currentRole={currentRole}
              doctorUser={doctor}
              workerUser={worker}
              patientUser={activePatient}
              onOpenEditModal={() => setIsEditProfileOpen(true)}
              onLogout={handleLogout}
            />
          )}

          {/* ================= DOCTOR ROLE VIEWS ================= */}
          {currentRole === 'Doctor' && (
            <>
              {activeTab === 'dashboard' && (
                <DoctorDashboard
                  doctor={doctor}
                  sessions={sessions}
                  onSelectSession={(sess) => {
                    setSelectedSession(sess);
                    setActiveTab('patient_detail');
                  }}
                  onFilterCategory={(cat) => {
                    setSelectedFilterCategory(cat);
                    setActiveTab('patients');
                  }}
                  onViewAllQueue={() => {
                    setSelectedFilterCategory('All');
                    setActiveTab('patients');
                  }}
                  onLogout={handleLogout}
                  onEditProfile={() => setIsEditProfileOpen(true)}
                />
              )}

              {activeTab === 'patients' && (
                <DoctorPatientList
                  sessions={sessions}
                  selectedFilterCategory={selectedFilterCategory}
                  onSelectSession={(sess) => {
                    setSelectedSession(sess);
                    setActiveTab('patient_detail');
                  }}
                />
              )}

              {activeTab === 'patient_detail' && selectedSession && (
                <DoctorPatientDetails
                  session={selectedSession}
                  doctor={doctor}
                  onBack={() => setActiveTab('dashboard')}
                  onSubmitAssessment={handleSubmitAssessment}
                  onUploadDoctorScreening={(newSession) => {
                    setSessions((prev) => [newSession, ...prev]);
                    setSelectedSession(newSession);
                    setDoctor((prev) => ({
                      ...prev,
                      stats: {
                        ...prev.stats,
                        totalSessions: prev.stats.totalSessions + 1,
                        reviewed: prev.stats.reviewed + 1,
                      },
                    }));
                    const newNotif: NotificationItem = {
                      id: `notif-${Date.now()}`,
                      title: 'Direct Physician Screening Logged',
                      message: `Dr. ${doctor.name} completed direct fundus acquisition and assessment for ${newSession.patientName} (${newSession.patientId}).`,
                      timestamp: 'Just now',
                      isRead: false,
                      type: 'assessment_done',
                      roleTarget: 'Doctor',
                      patientId: newSession.patientId,
                      sessionId: newSession.id,
                    };
                    setNotifications((prev) => [newNotif, ...prev]);
                  }}
                />
              )}

              {activeTab === 'analytics' && <DoctorAnalytics sessions={sessions} />}

              {activeTab === 'referrals' && (
                <WorkerReferrals
                  referrals={referrals}
                  onUpdateReferral={handleUpdateReferral}
                />
              )}
            </>
          )}

          {/* ================= HEALTHCARE WORKER VIEWS ================= */}
          {currentRole === 'Healthcare Worker' && (
            <>
              {activeTab === 'home' && (
                <WorkerHome
                  worker={worker}
                  sessions={sessions}
                  referrals={referrals}
                  onNavigateAction={(action) => {
                    if (action === 'new-patient') {
                      setActiveTab('new-patient');
                    } else if (action === 'existing-patient') {
                      setActiveTab('existing-patient');
                    } else if (action === 'referrals') {
                      setActiveTab('referrals');
                    }
                  }}
                  onSelectSession={(sess) => {
                    setSelectedSession(sess);
                    setActiveTab('patient_detail');
                  }}
                  onLogout={handleLogout}
                  onEditProfile={() => setIsEditProfileOpen(true)}
                />
              )}

              {activeTab === 'new-patient' && (
                <WorkerRegisterPatient
                  onBack={() => setActiveTab('home')}
                  onRegisterComplete={handleRegisterPatientComplete}
                />
              )}

              {activeTab === 'existing-patient' && (
                <WorkerExistingPatient
                  patients={patients}
                  sessions={sessions}
                  referrals={referrals}
                  onSelectSession={(sess) => {
                    setSelectedSession(sess);
                    setActiveTab('patient_detail');
                  }}
                  onStartScreeningForPatient={(patient) => {
                    setActiveScreeningPatientId(patient.id);
                    setActiveTab('screen');
                  }}
                  onRegisterNewPatient={() => setActiveTab('new-patient')}
                />
              )}

              {activeTab === 'screen' && (
                <WorkerScreeningFlow
                  worker={worker}
                  patients={patients}
                  initialPatientId={activeScreeningPatientId}
                  onBack={() => setActiveTab('home')}
                  onCompleteScreening={handleCompleteScreening}
                />
              )}

              {activeTab === 'referrals' && (
                <WorkerReferrals
                  referrals={referrals}
                  onUpdateReferral={handleUpdateReferral}
                />
              )}

              {activeTab === 'list' && (
                <WorkerPatientList
                  sessions={sessions}
                  onSelectSession={(sess) => {
                    setSelectedSession(sess);
                    setActiveTab('patient_detail');
                  }}
                  onNewRegistration={() => setActiveTab('new-patient')}
                />
              )}

              {activeTab === 'patient_detail' && selectedSession && (
                <DoctorPatientDetails
                  session={selectedSession}
                  doctor={doctor}
                  onBack={() => setActiveTab('existing-patient')}
                  onSubmitAssessment={handleSubmitAssessment}
                />
              )}
            </>
          )}

          {/* ================= PATIENT PORTAL VIEW ================= */}
          {currentRole === 'Patient' && activeTab !== 'notifications' && activeTab !== 'profile' && (
            <PatientPortal
              patient={activePatient}
              sessions={sessions}
              referrals={referrals}
              notifications={notifications}
              activeTab={activeTab === 'history' ? 'history' : 'home'}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onLogout={handleLogout}
              onOpenEditModal={() => setIsEditProfileOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>RetinaX</strong> • AI-Assisted Diabetic Retinopathy Screening & Clinical Review
          </span>
          <span className="text-[11px] text-gray-400">
            Powered by 8 Neural Decision Support Models • Strict Role Partitioning (Doctor, Worker, Patient)
          </span>
        </div>
      </footer>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        role={currentRole}
        initialData={{
          name: userProfile.name,
          email:
            currentRole === 'Doctor'
              ? doctor.email
              : currentRole === 'Healthcare Worker'
              ? worker.email
              : 'patient@retinax.org',
          phone:
            currentRole === 'Doctor'
              ? doctor.phone
              : currentRole === 'Healthcare Worker'
              ? worker.phone
              : activePatient.phone,
          organizationOrHospital:
            currentRole === 'Doctor'
              ? doctor.hospital
              : currentRole === 'Healthcare Worker'
              ? worker.organization
              : activePatient.area,
          areaOrSpecialization:
            currentRole === 'Doctor'
              ? doctor.specialization
              : currentRole === 'Healthcare Worker'
              ? worker.area
              : 'Patient Profile',
        }}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Floating Netra AI Assistant (Fixed bottom-right, compact pill button, opens right-side panel) */}
      {renderNetraAI()}
    </div>
  );
}

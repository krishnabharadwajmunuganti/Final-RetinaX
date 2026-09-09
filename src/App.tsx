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
import {
  authApi,
  reportsApi,
  transitPassApi,
  notificationsApi,
  authStorage,
} from './services/api';
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

  // Domain Data State (dynamically fetched from FastAPI Backend)
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

  // Load Live Domain Data from FastAPI Backend based on Role & ID
  const loadLiveDomainData = async (role: Role, userId: string) => {
    try {
      if (role === 'Doctor') {
        const [reps, passes, pats, notifs] = await Promise.all([
          reportsApi.getReports().catch(() => []),
          transitPassApi.getAllTransitPasses().catch(() => []),
          authApi.getPatients().catch(() => []),
          notificationsApi.getNotifications(userId).catch(() => []),
        ]);

        if (reps && reps.length > 0) {
          setSessions(reps);
          setSelectedSession(reps[0]);
        }
        if (passes && passes.length > 0) setReferrals(passes);
        if (pats && pats.length > 0) setPatients(pats);
        if (notifs) setNotifications(notifs);

        setDoctor((prev) => ({
          ...prev,
          stats: {
            totalSessions: reps?.length || prev.stats.totalSessions,
            reviewed: reps ? reps.filter((r) => r.reviewStatus === 'Reviewed').length : prev.stats.reviewed,
            referred: passes ? passes.length : prev.stats.referred,
            pending: reps ? reps.filter((r) => r.reviewStatus === 'Pending Review').length : prev.stats.pending,
          },
        }));
      } else if (role === 'Healthcare Worker') {
        const [pats, reps, passes, notifs] = await Promise.all([
          authApi.getPatients().catch(() => []),
          reportsApi.getReports().catch(() => []),
          transitPassApi.getAllTransitPasses().catch(() => []),
          notificationsApi.getNotifications(userId).catch(() => []),
        ]);

        if (pats && pats.length > 0) setPatients(pats);
        if (reps && reps.length > 0) {
          setSessions(reps);
          setSelectedSession(reps[0]);
        }
        if (passes && passes.length > 0) setReferrals(passes);
        if (notifs) setNotifications(notifs);

        setWorker((prev) => ({
          ...prev,
          stats: {
            patientsRegistered: pats?.length || prev.stats.patientsRegistered,
            sessionsCompleted: reps?.length || prev.stats.sessionsCompleted,
            pendingReview: reps ? reps.filter((r) => r.reviewStatus === 'Pending Review').length : prev.stats.pendingReview,
            urgentFollowUps: passes ? passes.filter((p) => p.urgency === 'Urgent').length : prev.stats.urgentFollowUps,
          },
        }));
      } else if (role === 'Patient') {
        const [reps, passes] = await Promise.all([
          reportsApi.getReports({ patient_id: userId }).catch(() => []),
          transitPassApi.getPatientTransitPasses(userId).catch(() => []),
        ]);

        if (reps && reps.length > 0) {
          setSessions(reps);
          setSelectedSession(reps[0]);
        }
        if (passes && passes.length > 0) setReferrals(passes);
        // User Directive: Notifications completely hidden and empty for Patient
        setNotifications([]);
      }
    } catch (err) {
      console.warn('Backend live sync notice:', err);
    }
  };

  // Check and restore persisted auth session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = authStorage.getToken();
      if (!token) return;

      try {
        const me = await authApi.getMe();
        if (me?.user) {
          const u = me.user;
          let role: Role = 'Doctor';
          if (u.role === 'health_worker') role = 'Healthcare Worker';
          else if (u.role === 'patient') role = 'Patient';

          setCurrentRole(role);
          setAuthView('authenticated');

          if (role === 'Doctor') {
            setDoctor((prev) => ({
              ...prev,
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone || prev.phone,
              hospital: u.hospital_or_area || prev.hospital,
            }));
            setActiveTab('dashboard');
          } else if (role === 'Healthcare Worker') {
            setWorker((prev) => ({
              ...prev,
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone || prev.phone,
              organization: u.hospital_or_area || prev.organization,
            }));
            setActiveTab('home');
          } else if (role === 'Patient') {
            setActivePatient((prev) => ({
              ...prev,
              id: u.id,
              name: u.name,
              phone: u.phone || prev.phone,
              area: u.hospital_or_area || prev.area,
            }));
            setActiveTab('home');
          }

          await loadLiveDomainData(role, u.id);
        }
      } catch (err) {
        console.warn('Persisted session restoration error:', err);
        authStorage.clear();
      }
    };

    restoreSession();
  }, []);

  // Handlers for Login
  const handleLoginSuccess = async (role: Role, id: string) => {
    setCurrentRole(role);
    setAuthView('authenticated');

    try {
      const me = await authApi.getMe();
      if (me?.user) {
        const u = me.user;
        if (role === 'Doctor') {
          setDoctor((prev) => ({
            ...prev,
            id: u.id,
            name: u.name,
            email: u.email,
            hospital: u.hospital_or_area || prev.hospital,
          }));
        } else if (role === 'Healthcare Worker') {
          setWorker((prev) => ({
            ...prev,
            id: u.id,
            name: u.name,
            email: u.email,
            organization: u.hospital_or_area || prev.organization,
          }));
        } else if (role === 'Patient') {
          setActivePatient((prev) => ({
            ...prev,
            id: u.id,
            name: u.name,
            area: u.hospital_or_area || prev.area,
          }));
        }
      }
    } catch (err) {
      console.warn('User details fetch notice:', err);
    }

    if (role === 'Doctor') {
      setActiveTab('dashboard');
    } else if (role === 'Healthcare Worker') {
      setActiveTab('home');
    } else if (role === 'Patient') {
      const matched = patients.find((p) => p.id === id) || patients[0];
      setActivePatient(matched);
      setActiveTab('home');
    }

    await loadLiveDomainData(role, id);
  };

  const handleQuickDemoLogin = async (role: Role, id: string) => {
    try {
      if (role === 'Doctor') {
        await authApi.login('doctor@retinax.org', 'DoctorPass123!');
      } else if (role === 'Healthcare Worker') {
        await authApi.login('worker@retinax.org', 'WorkerPass123!');
      } else if (role === 'Patient') {
        await authApi.login('patient@retinax.org', 'PatientPass123!');
      }
    } catch (err) {
      console.warn('Quick demo auth notice:', err);
    }
    await handleLoginSuccess(role, id);
  };

  const handleLogout = () => {
    authStorage.clear();
    setCurrentRole(null);
    setAuthView('landing');
    setSelectedSession(null);
  };

  // Switch Role from header chip (for easy testing between Doctor, Worker, Patient)
  const handleSwitchRole = async (newRole: Role) => {
    setCurrentRole(newRole);
    if (newRole === 'Doctor') {
      setActiveTab('dashboard');
      await loadLiveDomainData('Doctor', doctor.id);
    } else if (newRole === 'Healthcare Worker') {
      setActiveTab('home');
      await loadLiveDomainData('Healthcare Worker', worker.id);
    } else if (newRole === 'Patient') {
      setActiveTab('home');
      await loadLiveDomainData('Patient', activePatient.id);
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
      await reportsApi.updateReportStatus(sessionId, 'reviewed', notes);

      // 2. If referred, generate transit pass
      if (decision === 'Refer to hospital' || decision === 'Urgent referral') {
        const targetSession = sessions.find((s) => s.id === sessionId);
        if (targetSession) {
          await transitPassApi.createTransitPass({
            patientId: targetSession.patientId,
            referralReason: notes,
            targetHospital: hospitalName || 'St. Jude Eye Institute Vitreoretinal Unit',
            urgency: decision === 'Urgent referral' ? 'Urgent' : 'Routine',
          });
        }
      }

      await loadLiveDomainData('Doctor', doctor.id);
    } catch (err) {
      console.error('Failed to submit assessment to backend API:', err);
    }

    // Optimistically update local session state
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
  };

  // Patient Registration by Worker
  const handleRegisterPatientComplete = async (
    newPatient: PatientProfile,
    startScreeningImmediately: boolean
  ) => {
    try {
      await authApi.register({
        name: newPatient.name,
        email: `${newPatient.id.toLowerCase().replace(/[^a-z0-9]/g, '')}@retinax.org`,
        password: 'PatientPass123!',
        role: 'patient',
        phone: newPatient.phone,
        hospital_or_area: newPatient.area,
        custom_id: newPatient.id,
      });
    } catch (err) {
      console.warn('Patient register backend notice (fallback active):', err);
    }

    try {
      const updatedPatients = await authApi.getPatients();
      if (updatedPatients && updatedPatients.length > 0) {
        setPatients(updatedPatients);
      } else {
        setPatients((prev) => [newPatient, ...prev.filter((p) => p.id !== newPatient.id)]);
      }
    } catch {
      setPatients((prev) => [newPatient, ...prev.filter((p) => p.id !== newPatient.id)]);
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
    setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
    setSelectedSession(newSession);

    if (currentRole) {
      await loadLiveDomainData(currentRole, worker.id);
    }

    setActiveTab('existing-patient');
  };

  // Referral Update by Worker
  const handleUpdateReferral = async (updated: ReferralItem) => {
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
    notificationsApi.markAsRead(item.id).catch(() => {});
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
      setDoctor((prev) => ({
        ...prev,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        hospital: updated.organizationOrHospital,
        specialization: updated.areaOrSpecialization,
      }));
    } else if (currentRole === 'Healthcare Worker') {
      setWorker((prev) => ({
        ...prev,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        organization: updated.organizationOrHospital,
        area: updated.areaOrSpecialization,
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
            handleQuickDemoLogin(role, id);
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
                notifications
                  .filter((n) => !n.isRead)
                  .forEach((n) => {
                    notificationsApi.markAsRead(n.id).catch(() => {});
                  });
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
              }}
              onToggleRead={(id) => {
                notificationsApi.markAsRead(id).catch(() => {});
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

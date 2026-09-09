import React, { useState } from 'react';
import {
  Search,
  User,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Phone,
  MapPin,
  Activity,
  Pill,
  ArrowRight,
  PlusCircle,
  FileText,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { PatientProfile, ScreeningSession, ReferralItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface WorkerExistingPatientProps {
  patients: PatientProfile[];
  sessions: ScreeningSession[];
  referrals: ReferralItem[];
  onSelectSession: (session: ScreeningSession) => void;
  onStartScreeningForPatient: (patient: PatientProfile) => void;
  onRegisterNewPatient: () => void;
}

export const WorkerExistingPatient: React.FC<WorkerExistingPatientProps> = ({
  patients,
  sessions,
  referrals,
  onSelectSession,
  onStartScreeningForPatient,
  onRegisterNewPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Do not auto-open full detail panel by default! null means directory mode
  const [viewingHistoryPatientId, setViewingHistoryPatientId] = useState<string | null>(null);

  // Live filter patients by ID, Name, or Area
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewingPatient = viewingHistoryPatientId
    ? patients.find((p) => p.id === viewingHistoryPatientId)
    : null;

  const patientSessions = viewingPatient
    ? sessions.filter((s) => s.patientId === viewingPatient.id)
    : [];

  const patientReferral = viewingPatient
    ? referrals.find((r) => r.patientId === viewingPatient.id)
    : undefined;

  // Render secondary full history record when requested
  if (viewingPatient) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            id="btn-back-to-existing-patients"
            onClick={() => setViewingHistoryPatientId(null)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-teal-800 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patient Search</span>
          </button>

          <button
            type="button"
            id="btn-history-start-screening"
            onClick={() => onStartScreeningForPatient(viewingPatient)}
            className="py-2 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Start Screening for this Patient</span>
          </button>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xl shadow-2xs">
                {viewingPatient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-gray-950">{viewingPatient.name}</h2>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                    {viewingPatient.id}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {viewingPatient.age} years old • {viewingPatient.gender} • {viewingPatient.area}
                </p>
              </div>
            </div>

            {patientReferral && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Active Hospital Referral
                  </span>
                  <span className="text-[11px] text-amber-700">
                    {patientReferral.hospitalName} ({patientReferral.status})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Demographic and Clinical Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 text-xs">
            <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-400 font-medium block text-[11px] uppercase tracking-wider">
                Address
              </span>
              <span className="font-semibold text-gray-900 mt-1 block">
                {viewingPatient.address || `${viewingPatient.area}, Primary Health Block`}
              </span>
            </div>
            <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-400 font-medium block text-[11px] uppercase tracking-wider">
                Contact & Phone
              </span>
              <span className="font-semibold text-gray-900 mt-1 block font-mono">
                {viewingPatient.phone}
              </span>
            </div>
            <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-400 font-medium block text-[11px] uppercase tracking-wider">
                Emergency Contact
              </span>
              <span className="font-semibold text-gray-900 mt-1 block">
                {viewingPatient.emergencyContact?.name || 'N/A'} ({viewingPatient.emergencyContact?.phone || 'N/A'})
              </span>
            </div>
            <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-400 font-medium block text-[11px] uppercase tracking-wider">
                Diabetes Diagnosis
              </span>
              <span className="font-semibold text-gray-900 mt-1 block">
                {viewingPatient.diabetesType || 'Type 2'} • {viewingPatient.durationYears || 5} yrs
              </span>
            </div>
          </div>
        </div>

        {/* Session Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-950">
                Screening Session Timeline ({patientSessions.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Click any historical session below to inspect optical captures, 8 AI model scores, and doctor sign-off.
              </p>
            </div>
          </div>

          {patientSessions.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No historical screening sessions logged for this patient yet.
            </div>
          ) : (
            <div className="space-y-3">
              {patientSessions.map((session, index) => (
                <div
                  key={session.id}
                  id={`session-item-${session.id}`}
                  onClick={() => onSelectSession(session)}
                  className="p-4 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      #{patientSessions.length - index}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-950 group-hover:text-teal-950">
                          {index === 0 ? 'Latest Screening — ' : 'Session — '} {session.date}
                        </span>
                        <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                          {session.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Eye: {session.laterality} • Quality: {session.imageQuality} • DR: {session.drGrade}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge type="risk" value={session.riskLevel} />
                    <StatusBadge type="review" value={session.reviewStatus} />
                    <div className="text-xs font-semibold text-teal-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Show ONLY "Search by Patient ID or Name" and scrollable list of enrolled patients!
  // Clicking a patient directly starts a new screening session for that patient.
  // "View History" link opens that patient's full record.
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          heading={`Existing Patient Directory — "Who are we screening today?"`}
          quote="Instant lookup and follow-up screening"
          description="Click any enrolled patient to launch a new screening session immediately, or view their longitudinal history."
        />

        <button
          type="button"
          id="btn-existing-intake-new"
          onClick={onRegisterNewPatient}
          className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-2xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-teal-700" />
          <span>Intake New Patient</span>
        </button>
      </div>

      {/* Search box: "Search by Patient ID or Name" */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          Search by Patient ID or Name
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="worker-search-patient-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type patient name, RX ID (e.g. RX-104582), or community area..."
            className="w-full text-sm pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Scrollable list of enrolled patients */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Enrolled Community Patients ({filteredPatients.length})
          </span>
          <span className="text-xs text-teal-800 font-medium">
            Click patient to start screening
          </span>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <User className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-medium text-gray-600">
              No enrolled patients found matching "{searchTerm}"
            </p>
            <button
              type="button"
              onClick={onRegisterNewPatient}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline"
            >
              Register as New Patient instead
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[620px] overflow-y-auto">
            {filteredPatients.map((patient) => {
              const patientSessionList = sessions.filter((s) => s.patientId === patient.id);
              const sessionCount = patientSessionList.length;
              const hasActiveReferral = referrals.some((r) => r.patientId === patient.id);

              return (
                <div
                  key={patient.id}
                  id={`existing-patient-row-${patient.id}`}
                  onClick={() => onStartScreeningForPatient(patient)}
                  className="py-4 px-3 sm:px-4 rounded-xl hover:bg-teal-50/40 border border-transparent hover:border-teal-200 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Patient Avatar, Name, ID, Age, Area, Session Count */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-teal-800 group-hover:text-white transition-colors">
                      {patient.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-950 group-hover:text-teal-950">
                          {patient.name}
                        </span>
                        <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.2 rounded border border-gray-200">
                          {patient.id}
                        </span>
                        {hasActiveReferral && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">
                            Referral Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {patient.age}y • {patient.gender} • {patient.area} •{' '}
                        <span className="font-semibold text-gray-700">
                          {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right side actions: Primary Start Screening hint + Secondary "View History" */}
                  <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      id={`btn-view-history-${patient.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingHistoryPatientId(patient.id);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-teal-400 bg-white hover:bg-teal-50 text-gray-700 hover:text-teal-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>View History</span>
                    </button>

                    <div className="px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs group-hover:shadow-xs transition-all">
                      <span>Start Screening</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

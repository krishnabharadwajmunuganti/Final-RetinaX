import React from 'react';
import {
  UserPlus,
  Search,
  ArrowRight,
  Clock,
  Calendar,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { WorkerUser, ScreeningSession, ReferralItem } from '../../types';
import { ProfileSummaryCard } from '../common/ProfileSummaryCard';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface WorkerHomeProps {
  worker: WorkerUser;
  sessions: ScreeningSession[];
  referrals: ReferralItem[];
  onNavigateAction: (action: 'new-patient' | 'existing-patient' | 'referrals') => void;
  onSelectSession: (session: ScreeningSession) => void;
  onLogout: () => void;
  onEditProfile: () => void;
}

export const WorkerHome: React.FC<WorkerHomeProps> = ({
  worker,
  sessions,
  referrals,
  onNavigateAction,
  onSelectSession,
  onLogout,
  onEditProfile,
}) => {
  const recentSessions = [...sessions].slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Summary Card (Matching design system spec) */}
      <ProfileSummaryCard
        role="Healthcare Worker"
        name={worker.name}
        idNumber={worker.id}
        avatarInitials={worker.avatarInitials}
        detailPrimary={worker.organization}
        detailSecondary={worker.area}
        lastLogin="Today, 07:45 AM"
        stats={[
          { label: 'Patients Registered', value: worker.stats.patientsRegistered },
          { label: 'Sessions Completed', value: worker.stats.sessionsCompleted },
        ]}
        onEditProfile={onEditProfile}
        onLogout={onLogout}
      />

      {/* Section Header */}
      <SectionHeader
        heading="Field Screening Actions"
        quote="Who are we screening today?"
        description="Choose whether to register a new community patient for initial intake or lookup an existing enrolled patient record to launch screening."
      />

      {/* Worker home — two large action cards side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Card 1: New Patient (Primary next-step card with teal-tinted border/highlight) */}
        <div
          id="worker-action-new-patient"
          onClick={() => onNavigateAction('new-patient')}
          className="bg-white rounded-2xl border-2 border-teal-500 ring-4 ring-teal-500/10 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              {/* Circular icon (person-plus) in a tinted circle */}
              <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors shadow-2xs">
                <UserPlus className="w-7 h-7" />
              </div>

              {/* Small step pill */}
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Step 1: Intake
              </span>
            </div>

            {/* Large bold title */}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-950 mb-2">
              New Patient
            </h3>

            {/* One description paragraph */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Register an unenrolled community member with diabetes history, contact information,
              and emergency contact verification before initiating real-time fundus image acquisition.
            </p>
          </div>

          {/* Bottom text link with an arrow ("Register & Start Screening") */}
          <div className="pt-4 border-t border-teal-100 flex items-center justify-between text-sm font-bold text-teal-800 group-hover:text-teal-950">
            <span>Register & Start Screening</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
          </div>
        </div>

        {/* Card 2: Existing Patient (Plain white with a gray border) */}
        <div
          id="worker-action-existing-patient"
          onClick={() => onNavigateAction('existing-patient')}
          className="bg-white rounded-2xl border border-gray-200 hover:border-teal-400 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              {/* Circular icon (magnifying glass) in a tinted circle */}
              <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors shadow-2xs">
                <Search className="w-7 h-7" />
              </div>

              {/* Small step pill */}
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                Step 2: Lookup
              </span>
            </div>

            {/* Large bold title */}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-950 mb-2">
              Existing Patient
            </h3>

            {/* One description paragraph */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Search enrolled patients by Patient ID or name to view screening history, longitudinal
              retinal images, doctor assessments, and active hospital referrals.
            </p>
          </div>

          {/* Bottom text link with an arrow ("Search Patient Records") */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-teal-800 group-hover:text-teal-950">
            <span>Search Patient Records</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
          </div>
        </div>
      </div>

      {/* Recent Field Screening Activity Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-700" />
              <h3 className="text-base font-bold text-gray-950">
                Recent Field Screening Activity
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest tele-ophthalmology sessions logged from your health post.
            </p>
          </div>

          <button
            onClick={() => onNavigateAction('existing-patient')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 shrink-0"
          >
            <span>View All Patients</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {recentSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              No field screening sessions logged yet. Register a patient to start screening.
            </div>
          ) : (
            recentSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 px-2 rounded-xl transition-colors cursor-pointer"
              >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    session.riskLevel === 'High Risk'
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : session.riskLevel === 'Referable'
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">
                      {session.patientName}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">
                      ({session.patientId})
                    </span>
                    <span className="text-xs text-gray-400">
                      • {session.patientAge}y • {session.laterality}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {session.patientArea} • {session.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <StatusBadge type="risk" value={session.riskLevel} />
                <StatusBadge type="review" value={session.reviewStatus} />
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  Calendar,
  ArrowRight,
  Eye,
  CheckCheck,
} from 'lucide-react';
import { DoctorUser, ScreeningSession, RiskLevel } from '../../types';
import { ProfileSummaryCard } from '../common/ProfileSummaryCard';
import { StatusBadge } from '../common/StatusBadge';

interface DoctorDashboardProps {
  doctor: DoctorUser;
  sessions: ScreeningSession[];
  onSelectSession: (session: ScreeningSession) => void;
  onFilterCategory: (category: string) => void;
  onViewAllQueue: () => void;
  onLogout: () => void;
  onEditProfile: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctor,
  sessions,
  onSelectSession,
  onFilterCategory,
  onViewAllQueue,
  onLogout,
  onEditProfile,
}) => {
  // Compute counts
  const highRiskCount = sessions.filter((s) => s.riskLevel === 'High Risk').length;
  const referableCount = sessions.filter((s) => s.riskLevel === 'Referable').length;
  const needsReviewCount = sessions.filter((s) => s.riskLevel === 'Needs Review').length;
  const lowRiskCount = sessions.filter((s) => s.riskLevel === 'Low Risk').length;
  const allCount = sessions.length;
  const recentCount = Math.min(sessions.length, 6);

  // Immediate Attention Queue (pending review cases)
  const pendingSessions = sessions.filter((s) => s.reviewStatus === 'Pending Review');
  const queueDisplayList = pendingSessions.length > 0 ? pendingSessions : sessions.slice(0, 4);

  // Triage cards grid: 6 cards, 3 per row as strictly specified:
  // High Risk, Referable, Needs Review, Low Risk, All Patients, Recent Screenings
  const triageCards = [
    {
      categoryKey: 'High Risk',
      badgeLabel: 'High Risk',
      count: highRiskCount,
      unit: highRiskCount === 1 ? 'PATIENT' : 'PATIENTS',
      title: 'High Risk Patients',
      description: 'Severe NPDR or active proliferative changes requiring immediate ophthalmologist review.',
      borderColor: 'border-rose-200 hover:border-rose-400',
      iconSquareBg: 'bg-rose-50 text-rose-600 border border-rose-200',
      badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
      icon: AlertTriangle,
    },
    {
      categoryKey: 'Referable',
      badgeLabel: 'Referable',
      count: referableCount,
      unit: referableCount === 1 ? 'PATIENT' : 'PATIENTS',
      title: 'Referable Retinopathy',
      description: 'Moderate NPDR or significant macular exudates flagged by deep neural networks.',
      borderColor: 'border-amber-200 hover:border-amber-400',
      iconSquareBg: 'bg-amber-50 text-amber-600 border border-amber-200',
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
      icon: AlertCircle,
    },
    {
      categoryKey: 'Needs Review',
      badgeLabel: 'Needs Review',
      count: needsReviewCount,
      unit: needsReviewCount === 1 ? 'PATIENT' : 'PATIENTS',
      title: 'Needs Clinical Review',
      description: 'Optical quality borderlines, optic disc cup depth elevation, or suspicious lesions.',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconSquareBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
      badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      icon: Clock,
    },
    {
      categoryKey: 'Low Risk',
      badgeLabel: 'Low Risk',
      count: lowRiskCount,
      unit: lowRiskCount === 1 ? 'PATIENT' : 'PATIENTS',
      title: 'Low Risk Screenings',
      description: 'No apparent diabetic retinopathy detected or stable mild non-proliferative changes.',
      borderColor: 'border-emerald-200 hover:border-emerald-400',
      iconSquareBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      icon: CheckCircle2,
    },
    {
      categoryKey: 'All Patients',
      badgeLabel: 'All Patients',
      count: allCount,
      unit: allCount === 1 ? 'PATIENT' : 'PATIENTS',
      title: 'All Enrolled Patients',
      description: 'Complete cross-district registry of diabetic patients undergoing tele-ophthalmology screening.',
      borderColor: 'border-gray-200 hover:border-gray-400',
      iconSquareBg: 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]',
      badgeClass: 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]',
      icon: Users,
    },
    {
      categoryKey: 'Recent Screenings',
      badgeLabel: 'Recent Screenings',
      count: recentCount,
      unit: recentCount === 1 ? 'SCREENING' : 'SCREENINGS',
      title: 'Recent Field Sessions',
      description: 'Newly acquired fundus photographs and multi-model screening outputs from rural health posts.',
      borderColor: 'border-teal-200 hover:border-teal-400',
      iconSquareBg: 'bg-teal-50 text-teal-700 border border-teal-200',
      badgeClass: 'bg-teal-50 text-teal-800 border border-teal-200',
      icon: Calendar,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Profile summary card */}
      <ProfileSummaryCard
        role="Doctor"
        name={doctor.name}
        idNumber={doctor.id}
        avatarInitials={doctor.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)}
        detailPrimary={doctor.specialization}
        detailSecondary={`${doctor.hospital} • Reg: ${doctor.regNumber}`}
        lastLogin="Today, 08:15 AM"
        stats={[
          { label: 'Reviewed', value: doctor.stats.reviewed },
          { label: 'Referred', value: doctor.stats.referred },
          { label: 'Total Sessions', value: doctor.stats.totalSessions },
        ]}
        onEditProfile={onEditProfile}
        onLogout={onLogout}
      />

      {/* 2. Section Header: Bold black heading, em dash, italic gray rhetorical question */}
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
            Triage & Clinical Review
          </h2>
          <span className="text-xl sm:text-2xl text-gray-400">—</span>
          <span className="text-base sm:text-lg italic text-gray-500 font-normal">
            "Who needs my attention?"
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">
          Prioritized clinical cases awaiting specialist grading, lesion verification, and hospital referral directives.
        </p>
      </div>

      {/* 3. Triage/summary cards grid: Three per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {triageCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.categoryKey}
              id={`triage-card-${card.categoryKey.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onFilterCategory(card.categoryKey)}
              className={`bg-white rounded-2xl border ${card.borderColor} p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group`}
            >
              <div>
                {/* Top row: Colored icon square top-left & matching color pill badge top-right */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${card.iconSquareBg} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${card.badgeClass}`}>
                    {card.badgeLabel}
                  </span>
                </div>

                {/* Large bold number with small uppercase gray unit label beside it */}
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-3xl font-bold text-gray-950 tracking-tight">
                    {card.count}
                  </span>
                  <span className="text-xs font-bold text-gray-400 tracking-wider">
                    {card.unit}
                  </span>
                </div>

                {/* Bold subtitle naming the triage group */}
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-teal-900 transition-colors">
                  {card.title}
                </h3>

                {/* One gray description sentence */}
                <p className="text-xs text-gray-500 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Thin divider + teal "View Filtered Patients" text link with arrow */}
              <div>
                <div className="border-t border-gray-100 my-4" />
                <div className="flex items-center justify-between text-xs font-bold text-teal-800 group-hover:text-teal-950">
                  <span>View Filtered Patients</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Queue / list section: "Immediate Attention Queue (N Pending)" */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-700" />
              <h3 className="text-lg font-bold text-gray-950">
                Immediate Attention Queue ({pendingSessions.length} Pending)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Field screening uploads requiring ophthalmologist counter-signature and clinical assessment.
            </p>
          </div>

          <button
            type="button"
            id="btn-view-all-queue"
            onClick={onViewAllQueue}
            className="text-xs font-bold text-teal-800 hover:text-teal-950 inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Patients</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* List of queue items */}
        {queueDisplayList.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">All Queue Items Reviewed</h4>
            <p className="text-xs text-gray-500">
              There are no pending triage cases currently awaiting assessment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {queueDisplayList.map((session) => (
              <div
                key={session.id}
                id={`queue-row-${session.id}`}
                onClick={() => onSelectSession(session)}
                className="py-4 px-2 sm:px-3 rounded-xl hover:bg-teal-50/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Left: colored circular icon avatar, name in bold with (ID) and age/gender, 2nd gray line */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${
                      session.riskLevel === 'High Risk'
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : session.riskLevel === 'Referable'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : session.riskLevel === 'Needs Review'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    }`}
                  >
                    <Eye className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-950 group-hover:text-teal-950">
                        {session.patientName}
                      </span>
                      <span className="text-xs font-mono text-gray-500 font-medium">
                        ({session.patientId})
                      </span>
                      <span className="text-xs text-gray-500">
                        • {session.patientAge}y • {session.patientGender}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {session.patientArea} • {session.laterality} • {session.date}
                    </p>
                  </div>
                </div>

                {/* Right: stack of colored status pill badges, DR grade in text, and solid teal "Review" button */}
                <div className="flex items-center gap-3.5 self-end md:self-center shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge type="risk" value={session.riskLevel} />
                      <StatusBadge type="review" value={session.reviewStatus} />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700">
                      AI Grade: <span className="font-bold">{session.drGrade}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    id={`btn-review-${session.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSession(session);
                    }}
                    className="py-2 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Review</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

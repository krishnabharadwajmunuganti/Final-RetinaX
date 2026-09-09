import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Activity,
  Pill,
  FileText,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Car,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Info,
  Bell,
  ArrowRight,
  ShieldCheck,
  Edit3,
  LogOut,
} from 'lucide-react';
import { PatientProfile, ScreeningSession, ReferralItem, NotificationItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface PatientPortalProps {
  patient: PatientProfile;
  sessions: ScreeningSession[];
  referrals: ReferralItem[];
  notifications?: NotificationItem[];
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
  onLogout: () => void;
  onOpenEditModal?: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patient,
  sessions,
  referrals,
  notifications = [],
  activeTab = 'home',
  onNavigateTab,
  onLogout,
  onOpenEditModal,
}) => {
  const patientSessions = sessions.filter((s) => s.patientId === patient.id);
  const latestSession = patientSessions[0];
  const patientReferral = referrals.find((r) => r.patientId === patient.id);

  // Selected session for expanded viewing in History table
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    patientSessions[0]?.id || ''
  );

  const selectedSession =
    patientSessions.find((s) => s.id === selectedSessionId) || patientSessions[0];

  const getPlainLanguageExplanation = (drGrade: string) => {
    switch (drGrade) {
      case 'No DR':
        return 'Good news: No signs of diabetic damage were detected on your retina. Keep your blood glucose and blood pressure well managed, and return for your next annual check.';
      case 'Mild NPDR':
        return 'Only tiny microvascular spots were noted. Your sight is safe. Good blood sugar and blood pressure control will help keep your retinas healthy.';
      case 'Moderate NPDR':
        return 'Noticeable diabetic changes and small leaky spots are present on your retina. An evaluation by an eye specialist is recommended to protect your vision.';
      case 'Severe NPDR':
      case 'Proliferative DR':
        return 'Significant diabetic blood vessel changes are present. An ophthalmologist evaluation is strongly recommended. Timely treatment can safeguard and preserve your sight.';
      default:
        return 'Your retinal image has been reviewed. Please follow the guidance provided by your healthcare provider.';
    }
  };

  const patientNotifications = notifications.filter(
    (n) => n.patientId === patient.id || n.roleTarget === 'Patient'
  );

  // 1. HOME VIEW
  const renderHome = () => (
    <div className="space-y-8">
      {/* Welcome Greeting Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-gray-950">
                  Welcome, {patient.name}
                </h1>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your personal tele-ophthalmology screening portal and eye wellness record.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('history')}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full History</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Summary Cards: Latest Screening, Last Screening Date, Total Screenings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Latest Screening */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Latest Screening
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-950 mb-1">
              {latestSession?.drGrade || 'Completed'}
            </div>
            <p className="text-xs text-gray-500">
              {latestSession ? `Risk: ${latestSession.riskLevel}` : 'No recent sessions'}
            </p>
          </div>
          <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-xs text-teal-800 font-semibold">
            <span>Status: Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Card 2: Last Screening Date */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Last Screening Date
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-950 mb-1">
              {latestSession ? latestSession.date : 'No screening on record'}
            </div>
            <p className="text-xs text-gray-500">
              {latestSession ? 'Examined at community health post' : 'No screenings recorded yet'}
            </p>
          </div>
          <div className="pt-3 border-t border-gray-100 mt-3 text-xs text-gray-500">
            {latestSession ? `Field Unit: ${latestSession.patientArea || 'Community Clinic'}` : 'Awaiting initial intake'}
          </div>
        </div>

        {/* Card 3: Total Screenings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Screenings
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-950 mb-1">
              {patientSessions.length}
            </div>
            <p className="text-xs text-gray-500">Screening records stored</p>
          </div>
          <div className="pt-3 border-t border-gray-100 mt-3 text-xs text-emerald-700 font-semibold">
            {patientSessions.length > 0 ? 'All images archived safely' : 'No records yet'}
          </div>
        </div>
      </div>

      {/* Hospital Referral Notice (if applicable) */}
      {patientReferral && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Recommended Hospital Referral
                </span>
                <h3 className="text-base font-bold text-amber-950">
                  {patientReferral.hospitalName}
                </h3>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
              Status: {patientReferral.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-amber-900">
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">Doctor's Clinical Directive:</p>
              <p className="text-gray-700 italic">
                "{patientReferral.reason || 'Please visit the eye center for specialized examination.'}"
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">Hospital Visit Preparation:</p>
              <p className="text-gray-700">
                • Please bring sunglasses as eye drops may temporarily dilate your pupils.<br />
                • Arrange transportation or have a family member accompany you.<br />
                • Bring your list of current medications and your RetinaX ID ({patient.id}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Eye Health & Daily Management Tips */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-700" />
          Tips for Protecting Your Vision with Diabetes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
            <span className="font-bold text-gray-900 block">1. Blood Sugar Control</span>
            <p>Keeping your HbA1c in your target range significantly slows down blood vessel changes in the eye.</p>
          </div>
          <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
            <span className="font-bold text-gray-900 block">2. Blood Pressure & Cholesterol</span>
            <p>Elevated blood pressure places extra mechanical strain on delicate retinal capillaries. Take prescribed meds regularly.</p>
          </div>
          <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
            <span className="font-bold text-gray-900 block">3. Regular Screenings</span>
            <p>Diabetic eye changes often cause zero early pain or symptoms. An annual fundus photo catches issues before sight is affected.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. MY HISTORY VIEW (SPEC: Table: Date | Result | Doctor Review → click session for date, image quality, DR result, referral recommendation, doctor assessment, follow-up — plain language, no technical AI metrics)
  const renderHistory = () => (
    <div className="space-y-8">
      <SectionHeader
        heading="My Screening History & Results"
        quote="How has my retinal health changed over time?"
        description="Review all completed examinations. Click any session to read the simple, plain-language summary provided by your eye doctor."
      />

      {/* Table: Date | Result | Doctor Review */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Result</th>
                <th className="py-3.5 px-6">Doctor Review</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patientSessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 text-xs">
                    No past screenings found.
                  </td>
                </tr>
              ) : (
                patientSessions.map((session) => {
                  const isSelected = session.id === selectedSession?.id;
                  return (
                    <tr
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{session.date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <StatusBadge type="risk" value={session.riskLevel} />
                          <span className="text-xs text-gray-600 font-medium">
                            {session.drGrade}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge type="review" value={session.reviewStatus} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-xs font-semibold text-teal-800 hover:text-teal-950">
                          {isSelected ? 'Viewing Details ↓' : 'View Details →'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Session Details (Strictly plain language, no technical AI metrics) */}
      {selectedSession && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Examination Summary
              </span>
              <h3 className="text-xl font-bold text-gray-950 mt-0.5">
                Screening on {selectedSession.date}
              </h3>
              <p className="text-xs text-gray-500">
                Examined eye: <strong>{selectedSession.laterality}</strong> • Screened by Community Health Worker {selectedSession.workerName}
              </p>
            </div>

            <StatusBadge type="risk" value={selectedSession.riskLevel} />
          </div>

          {/* Plain Language Explanation Box */}
          <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-700" />
              What this result means in simple terms:
            </h4>
            <p className="text-xs sm:text-sm text-teal-950 leading-relaxed font-medium">
              {getPlainLanguageExplanation(selectedSession.drGrade)}
            </p>
          </div>

          {/* Plain language metric fields: Image Quality, DR Result, Referral Recommendation, Doctor Assessment, Follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Image Quality */}
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                Photo Quality
              </span>
              <p className="font-bold text-gray-900 text-sm">
                Clear & High Quality ({selectedSession.imageQuality})
              </p>
              <p className="text-[11px] text-gray-500">
                Retinal blood vessels and the macula were clearly visible for evaluation.
              </p>
            </div>

            {/* DR Result */}
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                Diabetic Retinopathy Classification
              </span>
              <p className="font-bold text-gray-900 text-sm">
                {selectedSession.drGrade}
              </p>
              <p className="text-[11px] text-gray-500">
                {selectedSession.isReferable
                  ? 'Changes identified that benefit from clinic follow-up.'
                  : 'No sight-threatening changes identified.'}
              </p>
            </div>

            {/* Referral Recommendation */}
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                Referral Recommendation
              </span>
              <p className="font-bold text-gray-900 text-sm">
                {selectedSession.doctorAssessment?.decision || (selectedSession.isReferable ? 'Referral to Eye Clinic' : 'Routine Annual Follow-up')}
              </p>
              <p className="text-[11px] text-gray-500">
                {selectedSession.doctorAssessment?.hospitalName || 'St. Jude Eye Institute & Vitreoretinal Center'}
              </p>
            </div>

            {/* Follow-up Timeline */}
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                Recommended Follow-Up Timeframe
              </span>
              <p className="font-bold text-gray-900 text-sm">
                {selectedSession.doctorAssessment?.followUpDate
                  ? `Before ${selectedSession.doctorAssessment.followUpDate}`
                  : 'Within 30 to 60 days'}
              </p>
              <p className="text-[11px] text-gray-500">
                Please book an appointment with your optometrist or ophthalmologist.
              </p>
            </div>
          </div>

          {/* Doctor Assessment Notes */}
          {selectedSession.doctorAssessment?.notes && (
            <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" />
                Doctor's Clinical Notes
              </span>
              <p className="text-xs text-gray-700 italic leading-relaxed">
                "{selectedSession.doctorAssessment.notes}"
              </p>
            </div>
          )}

          {/* Retinal Image (Clean fundus picture preview) */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-5">
            <img
              src={selectedSession.originalImageUrl}
              alt="My Retinal Scan"
              className="w-32 h-32 rounded-lg object-cover border border-gray-200 shadow-2xs shrink-0"
            />
            <div className="space-y-1 text-xs text-gray-600">
              <h5 className="font-bold text-gray-900">Your Retinal Photograph</h5>
              <p>
                This high-resolution fundus photograph shows the back of your eye (retina), including your blood vessels and the macula (responsible for central vision).
              </p>
              <p className="text-gray-400 text-[11px]">
                This photograph is securely archived in your electronic tele-ophthalmology chart.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <SectionHeader
              heading="Patient Profile"
              quote="My registered personal and medical details"
              description="Review your diabetes history, contact information, and community clinic registration."
            />
            <div className="flex items-center gap-2">
              {onOpenEditModal && (
                <button
                  onClick={onOpenEditModal}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl">
                {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-bold text-gray-950">{patient.name}</h3>
                  <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    {patient.id}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {patient.age} years old • {patient.gender} • Registered at {patient.area}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                  Diabetes Classification
                </span>
                <p className="font-bold text-gray-900 text-sm">
                  {patient.diabetesType} ({patient.durationYears} Years)
                </p>
              </div>

              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                  Medications & Insulin
                </span>
                <p className="font-medium text-gray-800">{patient.medications}</p>
              </div>

              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                  Registered Phone
                </span>
                <p className="font-medium text-gray-900">{patient.phone}</p>
              </div>

              <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                  Assigned Village / Area
                </span>
                <p className="font-medium text-gray-900">{patient.area}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  FileCheck,
  Send,
  AlertTriangle,
  Building2,
  Clock,
  CheckCircle2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { ScreeningSession, DoctorUser } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';
import { RetinalVisualizer } from '../common/RetinalVisualizer';
import { UnifiedAIReport } from '../common/UnifiedAIReport';
import { DoctorImageUploadModal } from './DoctorImageUploadModal';

interface DoctorPatientDetailsProps {
  session: ScreeningSession;
  doctor: DoctorUser;
  onBack: () => void;
  onSubmitAssessment: (
    sessionId: string,
    decision: 'No immediate referral' | 'Follow-up required' | 'Refer to hospital' | 'Urgent referral',
    notes: string,
    hospitalName?: string,
    followUpDate?: string
  ) => void;
  onUploadDoctorScreening?: (newSession: ScreeningSession) => void;
}

export const DoctorPatientDetails: React.FC<DoctorPatientDetailsProps> = ({
  session,
  doctor,
  onBack,
  onSubmitAssessment,
  onUploadDoctorScreening,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [decision, setDecision] = useState<
    'No immediate referral' | 'Follow-up required' | 'Refer to hospital' | 'Urgent referral'
  >(
    session.doctorAssessment?.decision ||
      (session.riskLevel === 'High Risk'
        ? 'Urgent referral'
        : session.riskLevel === 'Referable'
        ? 'Refer to hospital'
        : 'No immediate referral')
  );

  const [notes, setNotes] = useState(
    session.doctorAssessment?.notes ||
      (session.riskLevel === 'High Risk'
        ? 'Fundus imaging confirms severe non-proliferative diabetic retinopathy with 4-quadrant hemorrhages and significant macular edema threat. Urgent vitreoretinal referral for OCT and anti-VEGF therapy.'
        : session.riskLevel === 'Referable'
        ? 'Perifoveal lipid exudate ring with moderate NPDR changes. Hospital referral recommended for OCT scan.'
        : 'Normal retinal vasculature. No immediate specialist intervention required. Scheduled routine annual screening.')
  );

  const [hospitalName, setHospitalName] = useState(
    session.doctorAssessment?.hospitalName || doctor.hospital || 'District Eye Hospital'
  );
  const [followUpDate, setFollowUpDate] = useState(
    session.doctorAssessment?.followUpDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [submitted, setSubmitted] = useState(!!session.doctorAssessment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAssessment(session.id, decision, notes, hospitalName, followUpDate);
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar: Back button + Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <button
          id="patient-details-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-teal-800 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registry / Queue</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md border border-gray-200">
            Session: {session.id}
          </span>
          <StatusBadge type="review" value={session.reviewStatus} />
        </div>
      </div>

      {/* 1. Patient Info Card & 2. Screening Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Patient Info */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                1. Patient Demographics
              </span>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                {session.patientId}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-950 mb-1">
              {session.patientName}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {session.patientAge} years old • {session.patientGender}
            </p>

            <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>+1 (555) 912-3482 (Direct & Emergency Contact)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{session.patientArea}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>Screened: {session.date} by {session.workerName}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
            Intake Field Unit: East Valley Tele-Screening Post 4
          </div>
        </div>

        {/* 2. Screening Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                2. Automated Screening Summary
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500">
                  Laterality: <strong className="text-gray-900">{session.laterality}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const context = {
                      patientId: session.patientId,
                      screeningId: session.id,
                      leftEye: {
                        grade: session.aiReport.drClassification.icdrScale,
                        stageName: session.aiReport.drClassification.grade,
                        confidence: session.aiReport.drClassification.confidence,
                        quality: session.aiReport.iqa.status,
                        lesions: [
                          session.aiReport.microaneurysms.detected
                            ? `Microaneurysms (${session.aiReport.microaneurysms.count})`
                            : null,
                          session.aiReport.hemorrhages.detected ? 'Hemorrhages' : null,
                          session.aiReport.exudates.detected ? 'Hard exudates' : null,
                        ].filter(Boolean) as string[],
                        gradCamAvailable: true,
                      },
                      referralStatus: session.isReferable ? 'Referable DR' : 'Non-referable',
                      doctorReviewStatus: session.reviewStatus,
                      summary: `Risk: ${session.riskLevel}, Quality: ${session.imageQuality}`,
                    };
                    window.dispatchEvent(
                      new CustomEvent('open-netra-ai', {
                        detail: {
                          context,
                          prompt: 'Explain this screening result in simple terms.',
                        },
                      })
                    );
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-700" />
                  <span>Ask Netra AI</span>
                </button>
              </div>
            </div>

            {/* Metric grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Overall Risk
                </span>
                <StatusBadge type="risk" value={session.riskLevel} size="sm" />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Image Quality
                </span>
                <StatusBadge type="quality" value={session.imageQuality} size="sm" />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  DR Classification
                </span>
                <span className="text-xs font-bold text-gray-900 block truncate">
                  {session.drGrade}
                </span>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Referable DR
                </span>
                <span
                  className={`text-xs font-bold ${
                    session.isReferable ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {session.isReferable ? 'Yes (Referral Urged)' : 'No'}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/60 p-3 rounded-xl border border-gray-100">
              <strong>Automated Clinical Note:</strong> Patient presents with {session.drGrade}. AI confidence is {session.aiReport.drClassification.confidence}%. Microaneurysms: {session.aiReport.microaneurysms.count} lesions detected. Macular hard exudate ring identified near foveal perimeter.
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-teal-800">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Fused by 8 deep clinical models with verified sensitivity & specificity.</span>
          </div>
        </div>
      </div>

      {/* 3. Original Retinal Image & Visualization Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <SectionHeader
            heading="Retinal Fundus Image & AI Derived Visualizations"
            quote="What does the retinal anatomy reveal?"
            description="The original retinal image is preserved unchanged. Select derived tabs to inspect Grad-CAM activations, microaneurysm points, hemorrhages, and vascular geometry."
          />

          <button
            id="doctor-upload-retinal-image-btn"
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="sm:self-start mt-2 sm:mt-0 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 transition-colors shadow-2xs shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Retinal Image</span>
          </button>
        </div>

        <RetinalVisualizer
          patientId={session.patientId}
          patientName={session.patientName}
          laterality={session.laterality}
          drGrade={session.drGrade}
          quality={session.imageQuality}
          hasExudates={session.aiReport.exudates.detected}
          hasHemorrhages={session.aiReport.hemorrhages.detected}
          hasMicroaneurysms={session.aiReport.microaneurysms.detected}
        />

        {/* Doctor Retinal Image Capture Modal */}
        <DoctorImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          patient={{
            id: session.patientId,
            name: session.patientName,
            age: session.patientAge,
            gender: session.patientGender,
            area: session.patientArea,
          }}
          doctor={doctor}
          onComplete={(newSession) => {
            if (onUploadDoctorScreening) {
              onUploadDoctorScreening(newSession);
            }
          }}
        />
      </div>

      {/* 4. Unified AI Report (Combining all 8 backend model outputs) */}
      <div>
        <SectionHeader
          heading="Unified Clinical Intelligence Report"
          quote="How do all 8 models converge?"
          description="Detailed breakdown of Image Quality, DR Staging, Referral Criteria, Microaneurysms, Hemorrhages, Hard/Soft Exudates, Optic Disc, and Vessels."
        />
        <UnifiedAIReport report={session.aiReport} />
      </div>

      {/* 5. Doctor Clinical Assessment Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-950">
              Doctor Clinical Assessment & Sign-off
            </h3>
            <p className="text-xs text-gray-500">
              Certified Ophthalmologist Evaluation by {doctor.name} ({doctor.regNumber})
            </p>
          </div>
        </div>

        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Clinical assessment successfully submitted! Designated field healthcare worker ({session.workerName}) and patient have been notified.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assessment Options Radio Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Clinical Recommendation *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'No immediate referral',
                  label: 'No immediate referral',
                  desc: 'Mild or no DR. Routine 12-month community screening.',
                },
                {
                  id: 'Follow-up required',
                  label: 'Follow-up required',
                  desc: 'Re-screen or HbA1c review within 3-6 months.',
                },
                {
                  id: 'Refer to hospital',
                  label: 'Refer to hospital',
                  desc: 'Specialist eye clinic appointment for OCT & slit-lamp.',
                },
                {
                  id: 'Urgent referral',
                  label: 'Urgent referral',
                  desc: 'Severe NPDR/PDR or macular edema. Urgent vitreo-retinal evaluation.',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                    decision === opt.id
                      ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">{opt.label}</span>
                      <input
                        type="radio"
                        name="doctorDecision"
                        value={opt.id}
                        checked={decision === opt.id}
                        onChange={() => setDecision(opt.id as any)}
                        className="accent-teal-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Hospital referral fields */}
          {(decision === 'Refer to hospital' || decision === 'Urgent referral') && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Designated Referral Hospital
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. St. Jude Eye Institute Vitreoretinal Unit"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Evaluation Timeline
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    defaultValue={decision === 'Urgent referral' ? 'Within 72 Hours (Urgent)' : 'Within 14 Days'}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Follow-up date */}
          {decision === 'Follow-up required' && (
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Scheduled Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* Free-text Doctor Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Doctor Clinical Notes & Instructions (Communicated to Healthcare Worker and Patient Slip) *
            </label>
            <textarea
              id="doctor-assessment-notes"
              rows={4}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record clinical impressions, specific lesion staging, pharmacological directives, or transport coordination notes..."
              className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-gray-500">
              Submitting updates patient record and dispatches referral alert to field worker {session.workerName}.
            </span>

            <button
              id="submit-doctor-assessment-btn"
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs inline-flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitted ? 'Update Signed Assessment' : 'Sign & Submit Clinical Assessment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

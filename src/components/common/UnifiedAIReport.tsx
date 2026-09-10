import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Activity,
  Layers,
  Sparkles,
  Search,
  Network,
  Disc,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { AIModelReport } from '../../types';

interface UnifiedAIReportProps {
  report: AIModelReport;
  onSelectTab?: (tab: string) => void;
}

export const UnifiedAIReport: React.FC<UnifiedAIReportProps> = ({ report, onSelectTab }) => {
  const isRejected = report.status === 'rejected_poor_quality' || report.iqa?.isAcceptable === false;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header and 8-Model Unified Summary Strip */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <h3 className="text-base font-bold text-gray-950">
              Unified AI Screening Intelligence Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              5 Live ONNX Models + 3 In Development
            </span>
            <button
              id="explain-with-netra-ai-btn"
              type="button"
              onClick={() => {
                const lesionsList: string[] = [];
                if (report.exudates?.detected) lesionsList.push(`Exudates (${report.exudates.pixelCount || 0} px)`);
                if (report.opticDisc?.detected) lesionsList.push(`Optic Disc (${report.opticDisc.status})`);
                if (report.vesselAnalysis?.detected) lesionsList.push(`Vessels (${report.vesselAnalysis.status})`);

                const context = {
                  summary: isRejected
                    ? `Image Quality Rejected: ${report.iqa.feedback || 'Recapture required'}`
                    : `Image Quality: ${report.iqa.status} (${report.iqa.score}%), DR: ${report.drClassification.grade} (${Math.round((report.drClassification.confidence || 0) * 100)}%), Referable: ${report.referableDR.isReferable ? 'Yes' : 'No'}`,
                  leftEye: {
                    grade: report.drClassification.icdrScale,
                    stageName: report.drClassification.grade,
                    confidence: report.drClassification.confidence,
                    quality: report.iqa.status,
                    lesions: lesionsList,
                    gradCamAvailable: false,
                  },
                  referralStatus: report.referableDR.isReferable ? 'Referable DR' : 'Non-referable',
                };
                window.dispatchEvent(
                  new CustomEvent('open-netra-ai', {
                    detail: {
                      context,
                      prompt: isRejected
                        ? 'Why was this scan rejected for poor image quality?'
                        : 'Would you like me to explain this screening report?',
                    },
                  })
                );
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-teal-800 hover:bg-teal-900 text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-teal-200" />
              <span>Explain with Netra AI</span>
            </button>
          </div>
        </div>

        {/* Quality Rejection Callout Banner */}
        {isRejected && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm text-amber-950">
                Screening Scan Rejected — Recapture Required
              </p>
              <p>
                {report.iqa.feedback ||
                  'Image quality insufficient for clinical grading. Automated triage rejected this image to prevent unreliable diagnostic outputs.'}
              </p>
              <p className="font-semibold text-amber-800 pt-1">
                Recommendation: Re-align non-mydriatic camera, adjust flash intensity, ensure patient fixation, and capture a new scan.
              </p>
            </div>
          </div>
        )}

        {/* Required One-Screen Summary Strip */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-mono text-gray-800 leading-relaxed overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-semibold text-gray-900">Summary:</span>
            <span>Image Quality: <strong className={report.iqa.status === 'Good' ? 'text-emerald-700' : 'text-amber-700'}>{report.iqa.status}</strong></span>
            <span className="text-gray-300">|</span>
            <span>DR: <strong className={isRejected ? 'text-amber-700' : 'text-rose-700'}>{report.drClassification.grade}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Referable: <strong className={report.referableDR.isReferable ? 'text-rose-700' : 'text-emerald-700'}>{report.referableDR.isReferable ? 'Yes' : 'No'}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Microaneurysm: <strong className="text-indigo-600 font-sans">Model in Development</strong></span>
            <span className="text-gray-300">|</span>
            <span>Hemorrhage: <strong className="text-indigo-600 font-sans">Model in Development</strong></span>
            <span className="text-gray-300">|</span>
            <span>Exudate: <strong className={report.exudates?.detected ? 'text-amber-700' : 'text-emerald-700'}>{report.exudates?.detected ? 'Detected' : 'None'}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Optic Disc: <strong className={report.opticDisc.status === 'Normal' ? 'text-emerald-700' : 'text-amber-700'}>{report.opticDisc.status}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Vessels: <strong className={report.vesselAnalysis.status === 'Normal' ? 'text-emerald-700' : 'text-rose-700'}>{report.vesselAnalysis.status}</strong></span>
          </div>
        </div>
      </div>

      {/* 8 Backend Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model 1: Image Quality Assessment (IQA) - LIVE ONNX */}
        <div className={`bg-white border rounded-xl p-4 space-y-2.5 transition-colors ${
          isRejected ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200 hover:border-teal-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Eye className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">1. IQA Model</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              report.iqa.status === 'Good'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {report.iqa.status} ({report.iqa.score}%)
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {isRejected ? 'Ungradeable Image' : 'Gradable Fundus Image'}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Sharpness: {report.iqa.sharpness}</p>
            <p>• Illumination: {report.iqa.illumination}</p>
            <p>• Field of view: {report.iqa.fieldOfView}</p>
          </div>
        </div>

        {/* Model 2: DR Classification - LIVE ONNX */}
        <div className={`bg-white border rounded-xl p-4 space-y-2.5 transition-colors ${
          isRejected ? 'border-gray-200 opacity-60' : 'border-rose-200 bg-rose-50/10 hover:border-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Activity className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">2. DR Grading</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              {isRejected ? 'Halted' : `ICDR Scale: ${report.drClassification.icdrScale}/4`}
            </span>
          </div>
          <p className="text-sm font-bold text-rose-900">{report.drClassification.grade}</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              • Confidence:{' '}
              <strong>
                {typeof report.drClassification.confidence === 'number' && report.drClassification.confidence <= 1
                  ? Math.round(report.drClassification.confidence * 100)
                  : Math.round(report.drClassification.confidence || 0)}
                %
              </strong>
            </p>
            <p>• Live ONNX model calibrated (RETINAX_DR_FINAL)</p>
          </div>
        </div>

        {/* Model 3: Referable DR - LIVE FUSED */}
        <div className={`bg-white border rounded-xl p-4 space-y-2.5 transition-colors ${
          isRejected ? 'border-gray-200 opacity-60' : 'border-amber-200 bg-amber-50/10 hover:border-amber-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">3. Referable DR</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              isRejected
                ? 'bg-gray-100 text-gray-600'
                : report.referableDR.isReferable
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {isRejected ? 'N/A (Recapture)' : report.referableDR.isReferable ? 'Referral Indicated' : 'Non-referable'}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {isRejected
              ? 'Triage Halted'
              : report.referableDR.isReferable
              ? 'Specialist Referral Recommended'
              : 'Routine Community Follow-up'}
          </p>
          <p className="text-xs text-gray-500 line-clamp-2">
            {report.referableDR.criteria}
          </p>
        </div>

        {/* Model 4: Microaneurysms - IN DEVELOPMENT */}
        <div className="bg-white border border-dashed border-indigo-200 rounded-xl p-4 space-y-2.5 bg-indigo-50/10 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">4. Microaneurysms</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Coming Soon
            </span>
          </div>
          <p className="text-sm font-bold text-indigo-950">Model in Development</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Status: <em>not_yet_implemented</em></p>
            <p className="line-clamp-2 text-indigo-800/80">
              Microaneurysm detection model is currently in development. No simulated lesions displayed.
            </p>
          </div>
        </div>

        {/* Model 5: Hemorrhages - IN DEVELOPMENT */}
        <div className="bg-white border border-dashed border-indigo-200 rounded-xl p-4 space-y-2.5 bg-indigo-50/10 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">5. Hemorrhages</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Coming Soon
            </span>
          </div>
          <p className="text-sm font-bold text-indigo-950">Model in Development</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Status: <em>not_yet_implemented</em></p>
            <p className="line-clamp-2 text-indigo-800/80">
              Hemorrhage classification model is currently in development. No simulated lesions displayed.
            </p>
          </div>
        </div>

        {/* Model 6: Exudates - LIVE ONNX */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">6. Exudates</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              report.exudates?.detected ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700'
            }`}>
              {report.exudates?.detected ? `${report.exudates.pixelCount || 0} px Detected` : 'None'}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {report.exudates?.macularInvolvement ? 'Macular Involvement' : 'Hard Lipid Deposits'}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Pattern: {report.exudates?.pattern || 'None'}</p>
            <p className="line-clamp-2">{report.exudates?.details}</p>
          </div>
        </div>

        {/* Model 7: Optic Disc Analysis - LIVE ONNX */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Disc className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">7. Optic Disc</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              report.opticDisc.status === 'Normal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              {report.opticDisc.status}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {report.opticDisc.cupToDiscRatio ? `C/D Ratio: ${report.opticDisc.cupToDiscRatio}` : 'Disc Localized'}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Margin: {report.opticDisc.marginClarity}</p>
            <p className="line-clamp-2">{report.opticDisc.details}</p>
          </div>
        </div>

        {/* Model 8: Retinal Vessel Analysis - LIVE ONNX */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Network className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">8. Vessel Analysis</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              report.vesselAnalysis.status === 'Normal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {report.vesselAnalysis.status}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900">
            Density: {report.vesselAnalysis.vesselDensity ? `${report.vesselAnalysis.vesselDensity}%` : 'Calibrated'}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Caliber: {report.vesselAnalysis.caliberRatio}</p>
            <p className="line-clamp-2">{report.vesselAnalysis.details}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

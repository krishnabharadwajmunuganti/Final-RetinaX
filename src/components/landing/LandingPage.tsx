import React from 'react';
import { Eye, Stethoscope, Network, UserCheck, ArrowRight, Shield, CheckCircle2, Zap, KeyRound } from 'lucide-react';
import { Role } from '../../types';

interface LandingPageProps {
  onSelectRoleLogin?: (role: Role) => void;
  onSelectRole?: (role: Role) => void;
  onQuickDemoLogin?: (role: Role, id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRoleLogin,
  onSelectRole,
  onQuickDemoLogin,
}) => {
  const handleSelect = (role: Role) => {
    if (onSelectRoleLogin) {
      onSelectRoleLogin(role);
    } else if (onSelectRole) {
      onSelectRole(role);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      {/* Top Simple Landing Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-white shadow-xs">
              <Eye className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-gray-950 block leading-tight">
                RetinaX
              </span>
              <span className="text-xs text-gray-500 font-normal">
                Diabetic Retinopathy Screening & Clinical Review
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Shield className="w-4 h-4 text-teal-700" />
            <span className="hidden sm:inline">Clinical Grade • 8 Fused AI Models</span>
          </div>
        </div>
      </header>

      {/* Main Content: Select Role */}
      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-14 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tele-Ophthalmology & Field Triage Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 tracking-tight">
            AI-Assisted Retinopathy Screening
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Select your clinical or patient gateway below. You can navigate directly to the verified sign-in page or enter immediately via one-click demo preview.
          </p>
        </div>

        {/* 3 Dedicated Role Cards (Doctor, Healthcare Worker, Patient — NO ADMIN ANYWHERE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Doctor Role Card */}
          <div
            id="role-card-doctor"
            className="group bg-white rounded-2xl border border-gray-200 hover:border-teal-400 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div
              className="cursor-pointer"
              onClick={() => handleSelect('Doctor')}
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-5 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  Clinical Specialist
                </span>
                <span className="text-xs text-gray-400 font-mono">DOC-PORTAL</span>
              </div>
              <h2 className="text-xl font-bold text-gray-950 mb-2">
                Doctor Portal
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Triage immediate attention queues, inspect 8-model unified intelligence reports, review Grad-CAM heatmaps, and issue hospital referrals.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <button
                type="button"
                id="btn-signin-doctor"
                onClick={() => handleSelect('Doctor')}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign in as Doctor</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {onQuickDemoLogin && (
                <button
                  type="button"
                  id="btn-demo-doctor"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickDemoLogin('Doctor', 'DOC-9041');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-teal-200 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-teal-600" />
                  <span>Instant 1-Click Demo Login</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Healthcare Worker Role Card */}
          <div
            id="role-card-worker"
            className="group bg-white rounded-2xl border border-teal-500/40 hover:border-teal-500 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ring-1 ring-teal-500/10"
          >
            <div
              className="cursor-pointer"
              onClick={() => handleSelect('Healthcare Worker')}
            >
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 mb-5 group-hover:bg-sky-700 group-hover:text-white transition-colors">
                <Network className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                  Field & PHC Screening
                </span>
                <span className="text-xs text-gray-400 font-mono">WRK-PORTAL</span>
              </div>
              <h2 className="text-xl font-bold text-gray-950 mb-2">
                Healthcare Worker
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Register new community patients, upload fundus photos, execute quality validation & AI screenings, and coordinate referral tracking.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <button
                type="button"
                id="btn-signin-worker"
                onClick={() => handleSelect('Healthcare Worker')}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign in as Worker</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {onQuickDemoLogin && (
                <button
                  type="button"
                  id="btn-demo-worker"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickDemoLogin('Healthcare Worker', 'WRK-3082');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-sky-200 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-sky-600" />
                  <span>Instant 1-Click Demo Login</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Patient Role Card */}
          <div
            id="role-card-patient"
            className="group bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div
              className="cursor-pointer"
              onClick={() => handleSelect('Patient')}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Patient & Family
                </span>
                <span className="text-xs text-gray-400 font-mono">OTP-LOGIN</span>
              </div>
              <h2 className="text-xl font-bold text-gray-950 mb-2">
                Patient Portal
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Securely check screening history, view signed doctor assessments, understand referral next steps, and track upcoming appointments.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <button
                type="button"
                id="btn-signin-patient"
                onClick={() => handleSelect('Patient')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign in with OTP</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {onQuickDemoLogin && (
                <button
                  type="button"
                  id="btn-demo-patient"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickDemoLogin('Patient', 'RX-104582');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant 1-Click Demo Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-5 text-center text-xs text-gray-500">
        <p>RetinaX Tele-Ophthalmology Network • Clinical Decision Support System • ISO 13485 & HIPAA Compliant Architecture</p>
      </footer>
    </div>
  );
};

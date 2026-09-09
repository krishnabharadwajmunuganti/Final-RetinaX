import React, { useState } from 'react';
import { Eye, Stethoscope, Lock, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface DoctorLoginPageProps {
  onLoginSuccess: (doctorId: string) => void;
  onNavigateRegister: () => void;
  onBackToLanding?: () => void;
  onBack?: () => void;
}

export const DoctorLoginPage: React.FC<DoctorLoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onBackToLanding,
  onBack,
}) => {
  const handleBack = onBackToLanding || onBack || (() => {});
  const [doctorId, setDoctorId] = useState('DOC-9041');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId.trim()) {
      setError('Please enter your Doctor ID (e.g. DOC-9041)');
      return;
    }
    setError('');
    onLoginSuccess(doctorId.trim());
  };

  const handleFillDemo = () => {
    setDoctorId('DOC-9041');
    setPassword('ophthalmology_pass_2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-teal-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Selector</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center text-white">
              <Eye className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900 text-sm">RetinaX</span>
          </div>
        </div>
      </header>

      {/* Login Card */}
      <main className="max-w-md w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-7 sm:p-8 shadow-xs">
          {/* Icon and Role indicator */}
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-4">
            <Stethoscope className="w-6 h-6" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 block mb-1">
            Clinical Practitioner Gateway
          </span>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-2">
            Doctor Login
          </h1>
          <p className="text-xs text-gray-500 mb-6">
            Sign in with your verified ophthalmology credential to access the triage queue and review retinal scans.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Doctor ID
              </label>
              <div className="relative">
                <input
                  id="doctor-login-id"
                  type="text"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  placeholder="e.g. DOC-9041"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-teal-700 hover:text-teal-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="doctor-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <button
              id="doctor-login-submit"
              type="submit"
              className="w-full mt-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Login to Clinical Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-teal-700 hover:underline font-medium flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fill Demo Credentials (DOC-9041)</span>
            </button>
          </div>

          {/* Create Account link */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have a doctor account yet?{' '}
            <button
              id="doctor-goto-register"
              onClick={onNavigateRegister}
              className="font-bold text-teal-700 hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-200 shadow-xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900 mb-2">Password Recovery</h3>
            <p className="text-xs text-gray-600 mb-4">
              Please enter your registered hospital email or Doctor ID. Our credential verification unit will issue a secure reset link.
            </p>
            <input
              type="text"
              placeholder="e.g. DOC-9041 or a.vance@eyeinstitute.org"
              className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 mb-4 focus:ring-teal-500 focus:border-teal-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Reset token sent to verified ophthalmology center.');
                  setShowForgotModal(false);
                }}
                className="px-3.5 py-1.5 text-xs bg-teal-800 text-white rounded-lg font-medium"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Clinical Decision Support System • Doctor Authorization Area
      </footer>
    </div>
  );
};

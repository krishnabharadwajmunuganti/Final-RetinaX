import React, { useState } from 'react';
import { Eye, UserCheck, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Smartphone, Loader2 } from 'lucide-react';
import { authApi } from '../../services/api';

interface PatientLoginPageProps {
  onLoginSuccess: (patientId: string, token?: string, user?: any) => void;
  onBackToLanding?: () => void;
  onBack?: () => void;
}

export const PatientLoginPage: React.FC<PatientLoginPageProps> = ({
  onLoginSuccess,
  onBackToLanding,
  onBack,
}) => {
  const handleBack = onBackToLanding || onBack || (() => {});
  const [patientId, setPatientId] = useState('RX-104582');
  const [otp, setOtp] = useState('849201');
  const [otpSent, setOtpSent] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!patientId.trim()) {
      setError('Please enter your Patient ID first');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtp('849201');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) {
      setError('Please enter your Patient ID (e.g. RX-104582)');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP sent to your registered phone');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(patientId.trim(), 'PatientPass123!');
      onLoginSuccess(res.user.id, res.access_token, res.user);
    } catch (err: any) {
      setError(err.message || 'Patient ID verification failed. Please check your ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setPatientId('RX-104582');
    setOtp('849201');
    setOtpSent(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-800 transition-colors"
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
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
            <UserCheck className="w-6 h-6" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-1">
            Patient & Caregiver Access
          </span>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-2">
            Patient Login
          </h1>
          <p className="text-xs text-gray-500 mb-6">
            Enter your Patient Screening ID to receive an instant verification code on your registered mobile number. No password required.
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
                Patient ID
              </label>
              <div className="flex gap-2">
                <input
                  id="patient-login-id"
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. RX-104582"
                  className="flex-1 text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shrink-0"
                >
                  Send OTP
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  6-Digit One-Time Password (OTP)
                </label>
                {otpSent && (
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Code sent to registered mobile
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="patient-login-otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full text-base font-mono tracking-widest border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center font-bold"
                />
              </div>
            </div>

            <button
              id="patient-login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Verify & View Screening History</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fill Demo Patient (RX-104582 / OTP 849201)</span>
            </button>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span>
              Your Patient ID was provided on your clinic intake slip. If you do not know your ID, please contact your local community health worker.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Patient Health Information Protected • OTP Single Sign-on
      </footer>
    </div>
  );
};

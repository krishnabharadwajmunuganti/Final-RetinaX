import React, { useState } from 'react';
import { Eye, Network, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../services/api';

interface WorkerLoginPageProps {
  onLoginSuccess: (workerId: string, token?: string, user?: any) => void;
  onNavigateRegister: () => void;
  onBackToLanding?: () => void;
  onBack?: () => void;
}

export const WorkerLoginPage: React.FC<WorkerLoginPageProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onBackToLanding,
  onBack,
}) => {
  const handleBack = onBackToLanding || onBack || (() => {});
  const [workerId, setWorkerId] = useState('worker@retinax.org');
  const [password, setPassword] = useState('WorkerPass123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId.trim()) {
      setError('Please enter your Worker Email or ID (e.g. WRK-3082)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(workerId.trim(), password);
      onLoginSuccess(res.user.id, res.access_token, res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid health worker credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setWorkerId('worker@retinax.org');
    setPassword('WorkerPass123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-sky-800 transition-colors"
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
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 mb-4">
            <Network className="w-6 h-6" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 block mb-1">
            Primary Health Center & Field Unit
          </span>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-2">
            Healthcare Worker Login
          </h1>
          <p className="text-xs text-gray-500 mb-6">
            Sign in with your Community Health Worker ID to register patients, capture fundus scans, and coordinate referrals.
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
                Worker ID
              </label>
              <div className="relative">
                <input
                  id="worker-login-id"
                  type="text"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  placeholder="e.g. WRK-3082"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium"
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
                  className="text-xs text-sky-700 hover:text-sky-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="worker-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <button
              id="worker-login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Login to Field Screening Hub</span>
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
              className="text-xs text-sky-700 hover:underline font-medium flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fill Demo Credentials (WRK-3082)</span>
            </button>
          </div>

          {/* Create Account link */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have a field worker account?{' '}
            <button
              id="worker-goto-register"
              onClick={onNavigateRegister}
              className="font-bold text-sky-700 hover:underline"
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
            <h3 className="text-base font-bold text-gray-900 mb-2">Worker Verification Recovery</h3>
            <p className="text-xs text-gray-600 mb-4">
              Enter your designated Primary Health Center email or Worker ID to reset your credentials with regional supervisor approval.
            </p>
            <input
              type="text"
              placeholder="e.g. WRK-3082 or m.chen@fieldhealth.org"
              className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 mb-4 focus:ring-sky-500 focus:border-sky-500"
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
                  alert('Verification reset request forwarded to District Health Admin.');
                  setShowForgotModal(false);
                }}
                className="px-3.5 py-1.5 text-xs bg-teal-800 text-white rounded-lg font-medium"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Tele-Ophthalmology Field Intake • Healthcare Worker Gateway
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Eye, Network, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { WorkerUser } from '../../types';
import { authApi } from '../../services/api';

interface WorkerRegisterPageProps {
  onRegisterSuccess: (newWorker: WorkerUser) => void;
  onBackToLogin?: () => void;
  onBack?: () => void;
}

export const WorkerRegisterPage: React.FC<WorkerRegisterPageProps> = ({
  onRegisterSuccess,
  onBackToLogin,
  onBack,
}) => {
  const handleBack = onBackToLogin || onBack || (() => {});
  const [formData, setFormData] = useState({
    fullName: '',
    workerId: '',
    email: '',
    phone: '',
    area: '',
    organization: '',
    password: '',
    confirmPassword: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.workerId || !formData.email || !formData.area || !formData.organization) {
      setError('Please fill in all required field screening worker details');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);

    const initials = formData.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'WK';

    const workerName = formData.fullName.includes('CHW') ? formData.fullName : `${formData.fullName}, CHW`;

    try {
      await authApi.register({
        name: workerName,
        email: formData.email,
        password: formData.password,
        role: 'health_worker',
        phone: formData.phone,
        hospital_or_area: formData.area || formData.organization,
        custom_id: formData.workerId,
      });

      const newWorker: WorkerUser = {
        id: formData.workerId,
        name: workerName,
        role: 'Healthcare Worker',
        email: formData.email,
        phone: formData.phone || '+1 (555) 000-0000',
        area: formData.area,
        organization: formData.organization,
        avatarInitials: initials,
        stats: {
          patientsRegistered: 0,
          sessionsCompleted: 0,
        },
      };

      onRegisterSuccess(newWorker);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Worker registration failed.');
    } finally {
      setLoading(false);
    }
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
            <span>Return to Worker Login</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center text-white">
              <Eye className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900 text-sm">RetinaX</span>
          </div>
        </div>
      </header>

      {/* Main Registration Form */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-7 sm:p-9 shadow-xs">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950">
                Worker Profile Registered Successfully
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your Community Health Worker account for Worker ID <strong>{formData.workerId}</strong> has been created. You can now log in to register field patients, take retinal images, and run AI screenings.
              </p>
              <div className="pt-4">
                <button
                  id="worker-return-login-btn"
                  onClick={onBackToLogin}
                  className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  <span>Return to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-950">Healthcare Worker Registration</h1>
                  <p className="text-xs text-gray-500">Register as a field coordinator, community nurse, or screening technician</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Maya Chen"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Worker ID *
                    </label>
                    <input
                      name="workerId"
                      type="text"
                      required
                      value={formData.workerId}
                      onChange={handleChange}
                      placeholder="e.g. WRK-3082"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-sky-500 focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="m.chen@fieldhealth.org"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 283-7741"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Area / Village / Sector *
                    </label>
                    <input
                      name="area"
                      type="text"
                      required
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="East Valley Sector 4"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Organization / PHC *
                    </label>
                    <input
                      name="organization"
                      type="text"
                      required
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="District Rural Tele-Ophthalmology Post"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    Register Healthcare Worker Account
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Primary Healthcare Intake Verification • RetinaX Field Services
      </footer>
    </div>
  );
};

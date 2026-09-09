import React, { useState } from 'react';
import { Eye, Stethoscope, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { DoctorUser } from '../../types';

interface DoctorRegisterPageProps {
  onRegisterSuccess: (newDoctor: DoctorUser) => void;
  onBackToLogin?: () => void;
  onBack?: () => void;
}

export const DoctorRegisterPage: React.FC<DoctorRegisterPageProps> = ({
  onRegisterSuccess,
  onBackToLogin,
  onBack,
}) => {
  const handleBack = onBackToLogin || onBack || (() => {});
  const [formData, setFormData] = useState({
    fullName: '',
    doctorId: '',
    email: '',
    phone: '',
    hospital: '',
    specialization: 'Ophthalmology & Retina',
    regNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.doctorId || !formData.email || !formData.hospital || !formData.regNumber) {
      setError('Please fill in all required clinical credentials');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');

    const initials = formData.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'DR';

    const newDoctor: DoctorUser = {
      id: formData.doctorId,
      name: formData.fullName.startsWith('Dr.') ? formData.fullName : `Dr. ${formData.fullName}`,
      role: 'Doctor',
      email: formData.email,
      phone: formData.phone || '+1 (555) 000-0000',
      hospital: formData.hospital,
      specialization: formData.specialization,
      regNumber: formData.regNumber,
      avatarInitials: initials,
      stats: {
        reviewed: 0,
        referred: 0,
        totalSessions: 0,
      },
    };

    onRegisterSuccess(newDoctor);
    setIsSuccess(true);
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
            <span>Return to Doctor Login</span>
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
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950">
                Doctor Account Created Successfully
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your credentials for Doctor ID <strong>{formData.doctorId}</strong> have been registered. You can now log in to review patient screening batches and issue clinical assessments.
              </p>
              <div className="pt-4">
                <button
                  id="doctor-return-login-btn"
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
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-950">Doctor Registration</h1>
                  <p className="text-xs text-gray-500">Register as an authorized ophthalmologist or retinal clinician</p>
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
                      placeholder="e.g. Dr. Alistair Vance"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Doctor ID *
                    </label>
                    <input
                      name="doctorId"
                      type="text"
                      required
                      value={formData.doctorId}
                      onChange={handleChange}
                      placeholder="e.g. DOC-9041"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500 font-mono"
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
                      placeholder="a.vance@eyeinstitute.org"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
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
                      placeholder="+1 (555) 438-9210"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Hospital / Clinic *
                    </label>
                    <input
                      name="hospital"
                      type="text"
                      required
                      value={formData.hospital}
                      onChange={handleChange}
                      placeholder="St. Jude Eye Institute"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Specialization
                    </label>
                    <input
                      name="specialization"
                      type="text"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="Vitreoretinal Specialist"
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Medical Council Registration No. *
                  </label>
                  <input
                    name="regNumber"
                    type="text"
                    required
                    value={formData.regNumber}
                    onChange={handleChange}
                    placeholder="e.g. MD-OPH-78921"
                    className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500 font-mono"
                  />
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
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
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
                      className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    Register Doctor Account
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Clinical Credential Verification • RetinaX Tele-Ophthalmology
      </footer>
    </div>
  );
};

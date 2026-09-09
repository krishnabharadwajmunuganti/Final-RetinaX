import React, { useState } from 'react';
import {
  User,
  Shield,
  Building2,
  Stethoscope,
  MapPin,
  Network,
  Phone,
  Mail,
  Award,
  Key,
  Calendar,
  CheckCircle2,
  Edit3,
  LogOut,
  Save,
  Clock,
  HeartPulse,
  Activity,
  Pill,
} from 'lucide-react';
import { DoctorUser, WorkerUser, PatientProfile, Role } from '../../types';
import { SectionHeader } from './SectionHeader';

interface RoleProfilePageProps {
  currentRole: Role;
  doctorUser?: DoctorUser;
  workerUser?: WorkerUser;
  patientUser?: PatientProfile;
  onLogout: () => void;
  onOpenEditModal: () => void;
}

export const RoleProfilePage: React.FC<RoleProfilePageProps> = ({
  currentRole,
  doctorUser,
  workerUser,
  patientUser,
  onLogout,
  onOpenEditModal,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          heading={`${currentRole} Profile & Credentials`}
          quote="My registered tele-ophthalmology credentials"
          description="Manage your clinical profile, verified affiliation, contact information, and account preferences."
        />

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenEditModal}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#DC2626] hover:bg-[#FEE2E2] text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xs ${
              currentRole === 'Doctor'
                ? 'bg-teal-800'
                : currentRole === 'Healthcare Worker'
                ? 'bg-sky-800'
                : 'bg-emerald-800'
            }`}
          >
            {currentRole === 'Doctor'
              ? doctorUser?.avatarInitials || 'DR'
              : currentRole === 'Healthcare Worker'
              ? workerUser?.avatarInitials || 'WK'
              : patientUser?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2) || 'PT'}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-950">
                {currentRole === 'Doctor'
                  ? doctorUser?.name
                  : currentRole === 'Healthcare Worker'
                  ? workerUser?.name
                  : patientUser?.name}
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {currentRole === 'Doctor'
                  ? doctorUser?.id
                  : currentRole === 'Healthcare Worker'
                  ? workerUser?.id
                  : patientUser?.id}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                {currentRole}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              {currentRole === 'Doctor'
                ? `${doctorUser?.specialization} • ${doctorUser?.hospital}`
                : currentRole === 'Healthcare Worker'
                ? `${workerUser?.organization} • ${workerUser?.area}`
                : `${patientUser?.age} years old • ${patientUser?.gender} • ${patientUser?.area}`}
            </p>

            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Registered & Active on RetinaX Network</span>
            </p>
          </div>
        </div>

        {/* Role Specific Details Section */}
        {currentRole === 'Doctor' && doctorUser && (
          <div className="pt-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Clinical Affiliation & Tele-Ophthalmology Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-teal-700" />
                  Medical Registration Number
                </span>
                <p className="text-sm font-bold text-gray-900 font-mono">
                  {doctorUser.regNumber}
                </p>
                <p className="text-[11px] text-gray-500">
                  State Medical Council of Ophthalmology Verified
                </p>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  Primary Hospital / Clinical Base
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {doctorUser.hospital}
                </p>
                <p className="text-[11px] text-gray-500">
                  Vitreoretinal Specialty & Inpatient Referral Center
                </p>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  Sub-Specialty Focus
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {doctorUser.specialization}
                </p>
                <p className="text-[11px] text-gray-500">
                  Diabetic eye disease, macular edema, proliferative retinopathy
                </p>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-700" />
                  Clinical Communication
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {doctorUser.email}
                </p>
                <p className="text-[11px] text-gray-500">
                  {doctorUser.phone} • Secure clinical notifications active
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Screening Performance & Impact
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-teal-50/40 border border-teal-200 rounded-xl">
                  <span className="text-xs text-teal-800 font-semibold uppercase">Reviewed</span>
                  <div className="text-2xl font-bold text-teal-950 mt-1">{doctorUser.stats.reviewed}</div>
                </div>
                <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl">
                  <span className="text-xs text-amber-800 font-semibold uppercase">Referred</span>
                  <div className="text-2xl font-bold text-amber-950 mt-1">{doctorUser.stats.referred}</div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-xs text-gray-700 font-semibold uppercase">Total Sessions</span>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{doctorUser.stats.totalSessions}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'Healthcare Worker' && workerUser && (
          <div className="pt-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Community Health Post & Field Deployment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-sky-700" />
                  Primary Healthcare Center (PHC)
                </span>
                <p className="text-sm font-bold text-gray-900 font-mono">
                  {workerUser.organization}
                </p>
                <p className="text-[11px] text-gray-500">
                  Designated Community Tele-Ophthalmology Screening Unit
                </p>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-700" />
                  Assigned Operational Area / Village
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {workerUser.area}
                </p>
                <p className="text-[11px] text-gray-500">
                  Coverage: 12 rural sub-sectors & diabetic outreach clinics
                </p>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-700" />
                  Contact & Dispatch
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {workerUser.email}
                </p>
                <p className="text-[11px] text-gray-500">{workerUser.phone}</p>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-700" />
                  Screening Hardware Authorization
                </span>
                <p className="text-sm font-bold text-gray-900">
                  RetinaX Handheld Non-Mydriatic Fundus Camera #108
                </p>
                <p className="text-[11px] text-gray-500">Calibrated & Certified ISO 10940</p>
              </div>
            </div>

            {/* Field Stats */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Field Intake Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-sky-50/40 border border-sky-200 rounded-xl">
                  <span className="text-xs text-sky-800 font-semibold uppercase">Patients Registered</span>
                  <div className="text-2xl font-bold text-sky-950 mt-1">{workerUser.stats.patientsRegistered}</div>
                </div>
                <div className="p-4 bg-teal-50/40 border border-teal-200 rounded-xl">
                  <span className="text-xs text-teal-800 font-semibold uppercase">Sessions Completed</span>
                  <div className="text-2xl font-bold text-teal-950 mt-1">{workerUser.stats.sessionsCompleted}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'Patient' && patientUser && (
          <div className="pt-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Personal Demographics & Medical History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                  Diabetes Classification
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {patientUser.diabetesType} ({patientUser.durationYears} Years Duration)
                </p>
                <p className="text-[11px] text-gray-500">
                  Regular tele-screening recommended every 6 to 12 months
                </p>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-emerald-700" />
                  Prescribed Diabetes Medications
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {patientUser.medications}
                </p>
                <p className="text-[11px] text-gray-500">Recorded during field enrollment</p>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  Phone & OTP Verification
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {patientUser.phone}
                </p>
                <p className="text-[11px] text-gray-500">Used for secure SMS login and appointment reminders</p>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  Address & Assigned Health Post
                </span>
                <p className="text-sm font-bold text-gray-900">
                  {patientUser.area}
                </p>
                <p className="text-[11px] text-gray-500">Primary Health Post: Sector 4 Community Clinic</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

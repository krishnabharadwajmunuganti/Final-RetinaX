import React from 'react';
import { Building2, Stethoscope, MapPin, Network, Clock, LogOut, Edit3, UserCheck, Shield } from 'lucide-react';
import { Role } from '../../types';

interface StatItem {
  label: string;
  value: number | string;
}

interface ProfileSummaryCardProps {
  role: Role;
  name: string;
  idNumber: string;
  avatarInitials: string;
  detailPrimary: string;
  detailSecondary: string;
  lastLogin?: string;
  stats: StatItem[];
  onEditProfile?: () => void;
  onLogout: () => void;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  role,
  name,
  idNumber,
  avatarInitials,
  detailPrimary,
  detailSecondary,
  lastLogin = 'Today, 08:15 AM',
  stats,
  onEditProfile,
  onLogout,
}) => {
  const getAvatarBg = () => {
    switch (role) {
      case 'Doctor':
        return 'bg-teal-800';
      case 'Healthcare Worker':
        return 'bg-sky-800';
      case 'Patient':
        return 'bg-emerald-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 mb-8 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Avatar + Details */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Square avatar with initials on solid color background */}
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl ${getAvatarBg()} text-white font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs`}
          >
            {avatarInitials}
          </div>

          <div className="space-y-1">
            {/* Name in large bold + ID pill next to name */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
                {name}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                {idNumber}
              </span>
            </div>

            {/* Role-specific detail line with small icons */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              {role === 'Doctor' ? (
                <>
                  <span className="inline-flex items-center gap-1.5 font-medium text-teal-800">
                    <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
                    {detailPrimary}
                  </span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1.5 text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                    {detailSecondary}
                  </span>
                </>
              ) : role === 'Healthcare Worker' ? (
                <>
                  <span className="inline-flex items-center gap-1.5 font-medium text-sky-800">
                    <Network className="w-4 h-4 text-sky-600 shrink-0" />
                    {detailPrimary}
                  </span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    {detailSecondary}
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    {detailPrimary}
                  </span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    {detailSecondary}
                  </span>
                </>
              )}
            </div>

            {/* Last login in small gray text */}
            <div className="flex items-center gap-1 text-xs text-gray-500 pt-0.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Last login: {lastLogin}</span>
            </div>
          </div>
        </div>

        {/* Right side: Light-gray rounded stat boxes + Edit Profile + Logout */}
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          {/* Rounded stat boxes */}
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 min-w-[100px] text-center"
            >
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                {stat.label}
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                {stat.value}
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pl-2">
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5 focus:outline-none"
              >
                <Edit3 className="w-4 h-4 text-gray-500" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3.5 py-2 text-sm font-medium text-[#DC2626] bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#FEE2E2] hover:border-[#DC2626] transition-colors inline-flex items-center gap-1.5 focus:outline-none"
            >
              <LogOut className="w-4 h-4 text-[#DC2626]" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

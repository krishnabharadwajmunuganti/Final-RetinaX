import React, { useState } from 'react';
import { Eye, Bell, ChevronDown, LogOut, User, RefreshCw, X, CheckCircle } from 'lucide-react';
import { Role } from '../../types';

interface HeaderProps {
  currentRole: Role;
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadNotificationsCount?: number;
  notifications?: string[];
  onOpenNotifications?: () => void;
  onLogout: () => void;
  onSwitchRole: (role: Role) => void;
  userProfile?: {
    name: string;
    detail: string;
    initials: string;
  };
  onEditProfile?: () => void;
  userName?: string;
  userOrg?: string;
  avatarInitials?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  unreadNotificationsCount,
  notifications = [],
  onOpenNotifications,
  onLogout,
  onSwitchRole,
  userProfile,
  onEditProfile,
  userName,
  userOrg,
  avatarInitials,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const displayName =
    userProfile?.name ||
    userName ||
    (currentRole === 'Doctor'
      ? 'Dr. Arthur Vance'
      : currentRole === 'Healthcare Worker'
      ? 'Priya Sharma'
      : 'Eleanor Vance');

  const displayOrg =
    userProfile?.detail ||
    userOrg ||
    (currentRole === 'Doctor'
      ? 'Apex Eye Research Institute'
      : currentRole === 'Healthcare Worker'
      ? 'East Valley Health Unit'
      : 'Patient ID: RX-104582');

  const displayInitials =
    userProfile?.initials ||
    avatarInitials ||
    displayName
      .split(' ')
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    'RX';

  const unreadCount = unreadNotificationsCount ?? notifications.length;

  // Define tabs per role (Strictly matching RetinaX v5 navigation specification)
  const getTabs = () => {
    switch (currentRole) {
      case 'Doctor':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'patients', label: 'Patient List' },
          { id: 'referrals', label: 'Referral Tracking' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'profile', label: 'Profile' },
        ];
      case 'Healthcare Worker':
        return [
          { id: 'home', label: 'Home' },
          { id: 'new-patient', label: 'New Patient' },
          { id: 'existing-patient', label: 'Existing Patient' },
          { id: 'referrals', label: 'Referrals' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'profile', label: 'Profile' },
        ];
      case 'Patient':
        return [
          { id: 'home', label: 'Home' },
          { id: 'history', label: 'My History' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'profile', label: 'Profile' },
        ];
    }
  };

  const tabs = getTabs();

  // Role pill styling
  const getRoleBadgeStyle = () => {
    switch (currentRole) {
      case 'Doctor':
        return 'border-teal-300 text-teal-800 bg-teal-50/50';
      case 'Healthcare Worker':
        return 'border-sky-300 text-sky-800 bg-sky-50/50';
      case 'Patient':
        return 'border-emerald-300 text-emerald-800 bg-emerald-50/50';
    }
  };

  const handleBellClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      setShowNotificationPopup(!showNotificationPopup);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo + Role badge + tagline underneath */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                {/* Rounded teal square logo icon (eye/scan glyph) */}
                <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
                  <Eye className="w-5 h-5 stroke-[2.2]" />
                </div>
                {/* Bold black "RetinaX" wordmark */}
                <span className="text-2xl font-bold tracking-tight text-gray-950">
                  RetinaX
                </span>
                {/* Small outlined pill badge showing current role */}
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getRoleBadgeStyle()}`}>
                  {currentRole}
                </span>
              </div>
              {/* Small gray tagline underneath */}
              <span className="text-xs text-gray-500 font-normal pl-0.5 mt-0.5">
                Diabetic Retinopathy Screening
              </span>
            </div>
          </div>

          {/* Center-left: horizontal nav tabs */}
          <nav className="hidden md:flex items-center gap-1.5 ml-8 mr-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right: notification bell + profile chip */}
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <div className="relative">
              <button
                id="header-notification-bell"
                onClick={handleBellClick}
                className="relative p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationPopup && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotificationPopup(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-3 z-50 animate-in fade-in-50">
                    <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-gray-700 tracking-wider">
                        Notifications ({notifications.length})
                      </span>
                      <button
                        onClick={() => setShowNotificationPopup(false)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif, idx) => (
                          <div key={idx} className="px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-start gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span>{notif}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400">
                          No unread notifications
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Chip */}
            <div className="relative">
              <button
                id="header-profile-chip"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 p-1.5 pl-2 pr-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-left focus:outline-none cursor-pointer"
              >
                {/* Small colored square avatar with user's initials */}
                <div className="w-9 h-9 rounded-lg bg-teal-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {displayInitials}
                </div>
                {/* Name in bold + hospital/organization in small gray text underneath */}
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-bold text-gray-900 leading-tight">
                    {displayName}
                  </span>
                  <span className="text-xs text-gray-500 leading-tight truncate max-w-[160px]">
                    {displayOrg}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-0.5" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{displayOrg}</p>
                      <p className="text-xs text-teal-700 font-medium mt-1">Signed in as {currentRole}</p>
                    </div>

                    <div className="py-1 border-b border-gray-100">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          if (onEditProfile) {
                            onEditProfile();
                          } else {
                            onTabChange('profile');
                          }
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span>Edit Profile</span>
                      </button>
                    </div>

                    {/* Role Switcher for clinical testing */}
                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/70">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-teal-600" /> Switch Demo Role
                      </p>
                      <div className="space-y-1">
                        {(['Doctor', 'Healthcare Worker', 'Patient'] as Role[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              onSwitchRole(r);
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between cursor-pointer ${
                              currentRole === r
                                ? 'bg-teal-100 text-teal-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <span>{r}</span>
                            {currentRole === r && <span className="text-teal-600 font-bold">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[#DC2626] hover:bg-[#FEE2E2] flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-[#DC2626]" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2.5 border-t border-gray-100 gap-2 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

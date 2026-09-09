import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCheck,
  Calendar,
  Eye,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { NotificationItem, Role } from '../../types';
import { SectionHeader } from './SectionHeader';

interface NotificationsPageProps {
  currentRole: Role;
  notifications: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onToggleRead?: (id: string) => void;
  onNavigateToNotificationTarget: (item: NotificationItem) => void;
  onBack?: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  currentRole,
  notifications,
  onMarkAllAsRead,
  onToggleRead,
  onNavigateToNotificationTarget,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'high_priority'>('all');

  // Filter notifications relevant to current role or marked 'All'
  const roleNotifications = notifications.filter(
    (n) => n.roleTarget === currentRole || n.roleTarget === 'All'
  );

  const filteredNotifications = roleNotifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'high_priority') return n.type === 'high_risk' || n.type === 'review_needed';
    return true;
  });

  const unreadCount = roleNotifications.filter((n) => !n.isRead).length;
  const highPriorityCount = roleNotifications.filter(
    (n) => n.type === 'high_risk' || n.type === 'review_needed'
  ).length;

  const getCategoryConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'high_risk':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-200',
          badgeText: 'HIGH RISK',
          badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
          borderHover: 'hover:border-rose-300 hover:ring-2 hover:ring-rose-500/10',
          dotColor: 'bg-rose-500',
        };
      case 'review_needed':
        return {
          icon: Clock,
          iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
          badgeText: 'NEEDS REVIEW',
          badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
          borderHover: 'hover:border-indigo-300 hover:ring-2 hover:ring-indigo-500/10',
          dotColor: 'bg-indigo-500',
        };
      case 'referral_update':
        return {
          icon: Eye,
          iconBg: 'bg-amber-50 text-amber-700 border border-amber-200',
          badgeText: 'REFERRAL UPDATE',
          badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
          borderHover: 'hover:border-amber-300 hover:ring-2 hover:ring-amber-500/10',
          dotColor: 'bg-amber-500',
        };
      case 'assessment_done':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
          badgeText: 'ASSESSMENT COMPLETE',
          badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
          borderHover: 'hover:border-emerald-300 hover:ring-2 hover:ring-emerald-500/10',
          dotColor: 'bg-emerald-500',
        };
      case 'followup':
      default:
        return {
          icon: Calendar,
          iconBg: 'bg-teal-50 text-teal-700 border border-teal-200',
          badgeText: 'FOLLOW-UP DUE',
          badgeClass: 'bg-teal-50 text-teal-800 border border-teal-200',
          borderHover: 'hover:border-teal-300 hover:ring-2 hover:ring-teal-500/10',
          dotColor: 'bg-teal-600',
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          heading={`Notifications & Alerts — "What needs my attention?"`}
          quote="Live clinical alerts and workflow updates"
          description={`Direct clinical notifications, referral tracking updates, and screening events for ${currentRole}.`}
        />

        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            onClick={onMarkAllAsRead}
            className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-gray-500" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Tabs at the top: All (N), Unread (N), High Priority (N) */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({roleNotifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'unread'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveFilter('high_priority')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'high_priority'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          High Priority ({highPriorityCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900 mb-1">No notifications in this view</h3>
            <p className="text-xs text-gray-500">
              You are completely caught up with screening alerts and clinical records.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const config = getCategoryConfig(notif.type);
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                id={`notification-card-${notif.id}`}
                onClick={() => onNavigateToNotificationTarget(notif)}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md cursor-pointer group ${
                  notif.isRead
                    ? 'border-gray-200 opacity-90'
                    : 'border-teal-300 bg-teal-50/15'
                } ${config.borderHover}`}
              >
                <div className="flex items-start gap-4">
                  {/* Colored icon on the left matching notification's category */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top line: Bold title with unread dot + status pill & timestamp on the right */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-950 group-hover:text-teal-900 transition-colors">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span
                            className="w-2 h-2 rounded-full bg-[#0F766E] shrink-0 animate-pulse"
                            title="Unread notification"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Colored status pill */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${config.badgeClass}`}
                        >
                          {config.badgeText}
                        </span>
                        {/* Timestamp */}
                        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                          {notif.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* One gray description sentence naming the specific patient/case */}
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      {notif.message}
                    </p>

                    {/* Bottom row: Patient ID pill + clickable target hint + Mark as Read button */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-2">
                        {notif.patientId && (
                          <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                            {notif.patientId}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-teal-800 flex items-center gap-1 group-hover:underline">
                          <span>Open Record</span>
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>

                      <button
                        type="button"
                        id={`btn-mark-read-${notif.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleRead) onToggleRead(notif.id);
                        }}
                        className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        {notif.isRead ? 'Mark as Unread' : 'Mark as Read'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2, Users, Calendar, ShieldAlert, Eye } from 'lucide-react';
import { RiskLevel, DRGrade, ImageQuality, ReviewStatus } from '../../types';

interface StatusBadgeProps {
  type: 'risk' | 'drGrade' | 'quality' | 'review' | 'custom';
  value: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className = '', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (type === 'risk' || type === 'custom') {
    switch (value) {
      case 'High Risk':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses} ${className}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>High Risk</span>
          </span>
        );
      case 'Referable':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses} ${className}`}>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Referable</span>
          </span>
        );
      case 'Needs Review':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses} ${className}`}>
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Needs Review</span>
          </span>
        );
      case 'Low Risk':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Low Risk</span>
          </span>
        );
      case 'All Patients':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] ${sizeClasses} ${className}`}>
            <Users className="w-3.5 h-3.5 text-[#4B5563]" />
            <span>All Patients</span>
          </span>
        );
      case 'Recent Screenings':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses} ${className}`}>
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Recent</span>
          </span>
        );
    }
  }

  if (type === 'quality') {
    switch (value) {
      case 'Good':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quality: Good</span>
          </span>
        );
      case 'Acceptable':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses} ${className}`}>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Quality: Acceptable</span>
          </span>
        );
      case 'Poor':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses} ${className}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Quality: Poor (Retake)</span>
          </span>
        );
    }
  }

  if (type === 'review') {
    switch (value) {
      case 'Pending Review':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses} ${className}`}>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'Reviewed':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reviewed</span>
          </span>
        );
      case 'Referred':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses} ${className}`}>
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            <span>Hospital Referred</span>
          </span>
        );
      case 'Follow-up Set':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses} ${className}`}>
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Follow-up Set</span>
          </span>
        );
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200 ${sizeClasses} ${className}`}>
      <Eye className="w-3.5 h-3.5 text-gray-600" />
      <span>{value}</span>
    </span>
  );
};

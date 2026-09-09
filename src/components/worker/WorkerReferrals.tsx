import React, { useState, useEffect } from 'react';
import {
  Share2,
  Calendar,
  Building2,
  Phone,
  CheckCircle2,
  Clock,
  Car,
  AlertTriangle,
  Plus,
  ArrowRight,
  User,
} from 'lucide-react';
import { ReferralItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface WorkerReferralsProps {
  referrals: ReferralItem[];
  onUpdateReferral: (updatedReferral: ReferralItem) => void;
}

export const WorkerReferrals: React.FC<WorkerReferralsProps> = ({
  referrals,
  onUpdateReferral,
}) => {
  const [selectedReferral, setSelectedReferral] = useState<ReferralItem | null>(referrals[0] || null);
  const [newLogNote, setNewLogNote] = useState('');
  const [actionType, setActionType] = useState<
    'Phone Call' | 'Transport Coordinated' | 'Appointment Booked' | 'Hospital Visit Confirmed'
  >('Phone Call');

  useEffect(() => {
    if (!selectedReferral && referrals.length > 0) {
      setSelectedReferral(referrals[0]);
    } else if (selectedReferral && !referrals.some((r) => r.id === selectedReferral.id)) {
      setSelectedReferral(referrals[0] || null);
    }
  }, [referrals]);

  const handleAdvanceStatus = (referral: ReferralItem) => {
    let nextStatus: ReferralItem['status'] = referral.status;
    if (referral.status === 'Referral Issued') nextStatus = 'Appointment Booked';
    else if (referral.status === 'Appointment Booked') nextStatus = 'Visit Completed';
    else if (referral.status === 'Visit Completed') nextStatus = 'Closed';

    const updated: ReferralItem = {
      ...referral,
      status: nextStatus,
      timeline: [
        ...referral.timeline,
        {
          status: nextStatus,
          date: 'Today, Just now',
          note: `Status progressed to ${nextStatus} by field healthcare worker.`,
        },
      ],
    };

    onUpdateReferral(updated);
    setSelectedReferral(updated);
  };

  const handleAddLogAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral || !newLogNote.trim()) return;

    const updated: ReferralItem = {
      ...selectedReferral,
      timeline: [
        ...selectedReferral.timeline,
        {
          status: selectedReferral.status,
          date: 'Today, Just now',
          note: `[${actionType}] ${newLogNote.trim()}`,
        },
      ],
    };

    onUpdateReferral(updated);
    setSelectedReferral(updated);
    setNewLogNote('');
  };

  const statusSteps: ReferralItem['status'][] = [
    'Referral Issued',
    'Appointment Booked',
    'Visit Completed',
    'Closed',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader
        heading="Referrals & Clinical Follow-up Management"
        quote="Who needs specialized vitreoretinal care?"
        description="Monitor referral pipelines, assist patients with hospital navigation, coordinate transport, and log specialist attendance."
      />

      {referrals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-900 mb-1">No Active Referrals Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Patients recommended for tertiary eye clinic or vitreoretinal referral by reviewing ophthalmologists will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: List of Referral items */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Active Referrals ({referrals.length})
            </span>
          </div>

          <div className="space-y-3">
            {referrals.map((r) => (
              <div
                key={r.id}
                id={`referral-card-${r.id}`}
                onClick={() => setSelectedReferral(r)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedReferral?.id === r.id
                    ? 'border-teal-600 bg-white shadow-sm ring-1 ring-teal-600'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-900">{r.patientName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.urgency === 'Urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.urgency}
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                  {r.reason}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                  <span>{r.hospitalName}</span>
                  <span className="font-semibold text-teal-800">{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Active Referral Detail & Action Logger */}
        {selectedReferral && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-200">
                      {selectedReferral.patientId}
                    </span>
                    <h3 className="text-lg font-bold text-gray-950">
                      {selectedReferral.patientName}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Referred by {selectedReferral.doctorName} on {selectedReferral.dateIssued}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="advance-status-btn"
                    onClick={() => handleAdvanceStatus(selectedReferral)}
                    disabled={selectedReferral.status === 'Closed'}
                    className="px-4 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>Advance Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status Tracking Step Visualizer */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-3">
                  Referral Lifecycle Pipeline
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {statusSteps.map((step, idx) => {
                    const currentIdx = statusSteps.indexOf(selectedReferral.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = selectedReferral.status === step;

                    return (
                      <div
                        key={step}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600'
                            : isPassed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                      >
                        <span className="text-[10px] font-bold block mb-1">STEP {idx + 1}</span>
                        <p className={`text-xs font-bold ${isCurrent ? 'text-teal-900' : ''}`}>
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referral Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Specialist Destination</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>{selectedReferral.hospitalName}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block mb-1">Target Appointment</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>{selectedReferral.targetAppointmentDate}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-400 block mb-1">Referral Reason</span>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {selectedReferral.reason}
                  </p>
                </div>
              </div>

              {/* Action Log / Timeline */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-3">
                  Field Actions & Milestone Log
                </span>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedReferral.timeline.map((event, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-gray-200 text-xs flex items-start gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{event.status}</span>
                          <span className="text-[10px] text-gray-400">{event.date}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{event.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Log Action Form */}
              <form onSubmit={handleAddLogAction} className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white focus:ring-teal-500 focus:border-teal-500 font-medium"
                  >
                    <option value="Phone Call">Log Patient Phone Call</option>
                    <option value="Transport Coordinated">Coordinate Transport Assistance</option>
                    <option value="Appointment Booked">Confirm Hospital Booking</option>
                    <option value="Hospital Visit Confirmed">Verify Doctor Consultation Completed</option>
                  </select>

                  <input
                    type="text"
                    required
                    placeholder="Enter action details (e.g. booked van ride with village elder, confirmed patient ticket)..."
                    value={newLogNote}
                    onChange={(e) => setNewLogNote(e.target.value)}
                    className="flex-1 text-xs border border-gray-300 rounded-xl px-3.5 py-2 focus:ring-teal-500 focus:border-teal-500"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Log Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

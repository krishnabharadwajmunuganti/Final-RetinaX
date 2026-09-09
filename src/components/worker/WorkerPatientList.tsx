import React, { useState } from 'react';
import { Search, Eye, Filter, Calendar, UserPlus } from 'lucide-react';
import { ScreeningSession } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface WorkerPatientListProps {
  sessions: ScreeningSession[];
  onSelectSession: (session: ScreeningSession) => void;
  onNewRegistration: () => void;
}

export const WorkerPatientList: React.FC<WorkerPatientListProps> = ({
  sessions,
  onSelectSession,
  onNewRegistration,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTodayOnly, setFilterTodayOnly] = useState(false);

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.patientArea.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTodayOnly) {
      return s.date.includes('Today') || s.date.includes('2026-09-08');
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <SectionHeader
          heading="Field Screening Registry"
          quote="Who have we examined in the community?"
          description="View and verify completed field sessions, image quality statuses, and triage results."
        />

        <button
          onClick={onNewRegistration}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search & Toggle Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient Name, ID, or Village..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterTodayOnly}
              onChange={(e) => setFilterTodayOnly(e.target.checked)}
              className="accent-teal-700 w-4 h-4 rounded"
            />
            <span>Show Today's Sessions Only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sm:px-6">Patient ID</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-3">Eye</th>
                <th className="py-3.5 px-4">Quality (IQA)</th>
                <th className="py-3.5 px-4">AI DR Staging</th>
                <th className="py-3.5 px-4">Doctor Review</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                    No community screening sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-semibold text-gray-800">
                      {session.patientId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 group-hover:text-teal-700">
                      {session.patientName}
                    </td>
                    <td className="py-3.5 px-3 text-gray-600 font-medium">
                      {session.laterality}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="quality" value={session.imageQuality} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {session.drGrade}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="review" value={session.reviewStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {session.date}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSession(session);
                        }}
                        className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden md:inline">View Report</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

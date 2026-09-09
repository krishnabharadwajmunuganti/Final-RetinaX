import React, { useState, useEffect } from 'react';
import { Search, Eye, ArrowRight } from 'lucide-react';
import { ScreeningSession, RiskLevel } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface DoctorPatientListProps {
  sessions: ScreeningSession[];
  selectedFilterCategory?: string | null;
  onSelectSession: (session: ScreeningSession) => void;
}

export const DoctorPatientList: React.FC<DoctorPatientListProps> = ({
  sessions,
  selectedFilterCategory = null,
  onSelectSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRiskFilter, setActiveRiskFilter] = useState<string>('All');

  useEffect(() => {
    if (selectedFilterCategory) {
      if (selectedFilterCategory === 'All Patients') {
        setActiveRiskFilter('All');
      } else if (selectedFilterCategory === 'Recent Screenings') {
        setActiveRiskFilter('All');
      } else {
        setActiveRiskFilter(selectedFilterCategory);
      }
    }
  }, [selectedFilterCategory]);

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.patientArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.drGrade.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (activeRiskFilter === 'All') return true;
    return s.riskLevel === activeRiskFilter;
  });

  const categories = ['All', 'High Risk', 'Referable', 'Needs Review', 'Low Risk'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Section Header */}
      <SectionHeader
        heading={`Clinical Patient Registry — "Who have we screened?"`}
        quote="Search, filter, and review verified records"
        description="Access and examine tele-ophthalmology screening profiles, AI grading breakdowns, and specialist directives."
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="doctor-patient-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient Name, ID, Area, or Grade..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? sessions.length
                : sessions.filter((s) => s.riskLevel === cat).length;
            const isSelected = activeRiskFilter === cat;

            return (
              <button
                key={cat}
                id={`filter-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setActiveRiskFilter(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-teal-800 text-white border-teal-800 shadow-2xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-teal-950/40 text-teal-100' : 'bg-[#F3F4F6] text-[#4B5563]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sm:px-6">Patient ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-3">Age/Gender</th>
                <th className="py-3.5 px-4">Area / PHC</th>
                <th className="py-3.5 px-4">Screening Date</th>
                <th className="py-3.5 px-4">AI DR Grade</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                    No patient records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    id={`patient-row-${session.id}`}
                    onClick={() => onSelectSession(session)}
                    className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-gray-900 text-xs">
                      {session.patientId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-950 group-hover:text-teal-950">
                      {session.patientName}
                    </td>
                    <td className="py-3.5 px-3 text-gray-600">
                      {session.patientAge}y • {session.patientGender}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{session.patientArea}</td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">{session.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{session.drGrade}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="risk" value={session.riskLevel} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="review" value={session.reviewStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        id={`btn-open-session-${session.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSession(session);
                        }}
                        className="text-xs font-bold text-teal-800 hover:text-teal-950 inline-flex items-center gap-1 group-hover:underline cursor-pointer"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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

import React, { useState } from 'react';
import { X, User, Save, CheckCircle2 } from 'lucide-react';
import { Role } from '../../types';

interface EditProfileModalProps {
  isOpen: boolean;
  role: Role;
  initialData: {
    name: string;
    email: string;
    phone: string;
    organizationOrHospital: string;
    areaOrSpecialization: string;
  };
  onClose: () => void;
  onSave: (updatedData: {
    name: string;
    email: string;
    phone: string;
    organizationOrHospital: string;
    areaOrSpecialization: string;
  }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  role,
  initialData,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone);
  const [org, setOrg] = useState(initialData.organizationOrHospital);
  const [subDetail, setSubDetail] = useState(initialData.areaOrSpecialization);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      email,
      phone,
      organizationOrHospital: org,
      areaOrSpecialization: subDetail,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 border border-gray-200 shadow-xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-950">
              Edit {role} Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              {role === 'Doctor' ? 'Hospital / Eye Institute' : 'Organization / Health Center'}
            </label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              {role === 'Doctor' ? 'Specialization' : 'Assigned Area / Sector'}
            </label>
            <input
              type="text"
              value={subDetail}
              onChange={(e) => setSubDetail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

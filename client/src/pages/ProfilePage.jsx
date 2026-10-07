import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  User,
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export function ProfilePage() {
  const { user, pharmacy, role, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Pharmacy details
  const [pharmacyName, setPharmacyName] = useState(pharmacy?.name || '');
  const [pharmacyAddress, setPharmacyAddress] = useState(pharmacy?.address || '');
  const [pharmacyPhone, setPharmacyPhone] = useState(pharmacy?.phone || '');
  const [openingHours, setOpeningHours] = useState(pharmacy?.opening_hours || '8:00 AM - 10:00 PM');
  const [licenseNumber, setLicenseNumber] = useState(pharmacy?.license_number || '');

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        name,
        phone,
      };

      if (role === 'pharmacy') {
        payload.pharmacy = {
          name: pharmacyName,
          address: pharmacyAddress,
          phone: pharmacyPhone,
          opening_hours: openingHours,
          license_number: licenseNumber,
        };
      }

      await updateProfile(payload);
      showToast('Profile information updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Account & Profile Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile and registered store settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          {/* Header Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-2xl uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Account created on {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="pt-6 space-y-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Personal Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-0100"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pharmacy Specific Information */}
            {role === 'pharmacy' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4" /> Pharmacy Store Configuration
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    required
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Physical Address
                  </label>
                  <input
                    type="text"
                    required
                    value={pharmacyAddress}
                    onChange={(e) => setPharmacyAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Store Contact Phone
                    </label>
                    <input
                      type="text"
                      value={pharmacyPhone}
                      onChange={(e) => setPharmacyPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      placeholder="e.g. 8:00 AM - 10:00 PM"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pharmacy License #
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

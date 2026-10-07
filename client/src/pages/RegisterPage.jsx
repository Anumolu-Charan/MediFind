import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Pill, Mail, Lock, User, Phone, Store, MapPin, FileText, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient'); // 'patient' or 'pharmacy'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Pharmacy specific fields
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'pharmacy') {
      if (!pharmacyName || !pharmacyAddress) {
        setErrorMessage('Pharmacy name and address are required for pharmacy accounts.');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name,
        email,
        password,
        role,
        phone,
      };

      if (role === 'pharmacy') {
        payload.pharmacy_details = {
          name: pharmacyName,
          address: pharmacyAddress,
          phone: pharmacyPhone || phone,
          license_number: licenseNumber,
        };
      }

      const res = await register(payload);
      showToast('Registration successful! Welcome to MediFind.', 'success');

      if (role === 'pharmacy') {
        navigate('/pharmacy');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Pill className="w-6 h-6 -rotate-45" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              MediFind
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">
            Join MediFind to discover live medicine stock or manage your pharmacy
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === 'patient'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    role === 'patient' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Patient / Caregiver</p>
                  <p className="text-[11px] text-slate-500">Search & locate meds</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('pharmacy')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === 'pharmacy'
                    ? 'border-teal-500 bg-teal-50/50 text-teal-900 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    role === 'pharmacy' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Pharmacy Store</p>
                  <p className="text-[11px] text-slate-500">Manage store inventory</p>
                </div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Pharmacy Specific Fields */}
            {role === 'pharmacy' && (
              <div className="pt-4 mt-4 border-t border-slate-200 space-y-4 bg-slate-50/50 p-4 rounded-xl border">
                <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  Pharmacy Store Information
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    required
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    placeholder="e.g. Apex Health Pharmacy"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    required
                    value={pharmacyAddress}
                    onChange={(e) => setPharmacyAddress(e.target.value)}
                    placeholder="e.g. 102 Market St, Central Square"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pharmacy Contact Phone
                    </label>
                    <input
                      type="text"
                      value={pharmacyPhone}
                      onChange={(e) => setPharmacyPhone(e.target.value)}
                      placeholder="+1 555-8822"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      License / Registration #
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. RX-2026-99"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  MapPin,
  Pill,
  Store,
  ShieldCheck,
  Clock,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (isAiMode) {
      navigate(`/search?ai=true&q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularMedicines = [
    'Paracetamol',
    'Amoxicillin',
    'Ibuprofen',
    'Metformin',
    'Cetirizine',
    'Azithromycin',
    'Omeprazole',
    'Dolo 650',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Stock Verification • Powered by Supabase & Gemini</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Find Available Medicines in{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Nearby Pharmacies
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Don’t drive from store to store. Search by brand name, generic chemical, or natural language. MediFind checks live pharmacy inventory and provides instant directions.
            </p>

            {/* Main Search Bar Box */}
            <div className="mt-8 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 max-w-2xl mx-auto">
              {/* Tab Selector: Standard vs AI Assistant */}
              <div className="flex items-center gap-2 mb-3 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsAiMode(false)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    !isAiMode
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  Direct Medicine Search
                </button>

                <button
                  type="button"
                  onClick={() => setIsAiMode(true)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isAiMode
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini AI Natural Language
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {isAiMode ? (
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Search className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isAiMode
                        ? 'e.g. "I have a bad fever and headache, what is in stock?"'
                        : 'e.g. "Paracetamol", "Amoxicillin 500mg", "Dolo 650"'
                    }
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-900 placeholder-slate-400 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Search Stock</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Suggestions */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-400 mr-1">Trending:</span>
                {popularMedicines.map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => {
                      setSearchQuery(med);
                      setIsAiMode(false);
                      navigate(`/search?q=${encodeURIComponent(med)}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors"
                  >
                    {med}
                  </button>
                ))}
              </div>
            </div>

            {/* Safety Banner */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Safety Assurance: AI assists inventory searches only. It never provides diagnosis or prescriptions.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Designed for Patients, Pharmacists & Clinics
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              A synchronized ecosystem ensuring critical medicines are always within reach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Supabase Realtime Inventory</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When a pharmacy sells out or replenishes a medicine, your search results update instantaneously through WebSocket broadcasts—no manual page refresh needed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Geolocation & Google Directions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                MediFind detects your browser coordinates to calculate accurate distances to each pharmacy, displaying estimated drive times and direct navigation links.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Google Gemini AI Resolver</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Describe what you need in plain English. The backend Gemini model extracts generic chemical names and brand synonyms while strictly adhering to medical safety guardrails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Pathways CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-emerald-300 font-bold uppercase tracking-wider text-xs">
                For Pharmacy Owners
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2 leading-tight">
                Manage your store stock and connect with local patients today.
              </h2>
              <p className="text-emerald-100 text-sm mt-3 leading-relaxed">
                Join our pharmacy network. Update stock quantities in seconds with instant live visibility for surrounding neighborhoods.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/register"
                className="px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm rounded-xl shadow transition-all text-center"
              >
                Register Your Pharmacy
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-500/30 font-bold text-sm rounded-xl transition-all text-center"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

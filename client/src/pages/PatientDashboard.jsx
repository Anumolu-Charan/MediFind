import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { PharmacyCard } from '../components/PharmacyCard.jsx';
import { MapDirectionsModal } from '../components/MapDirectionsModal.jsx';
import {
  User,
  Search,
  Sparkles,
  MapPin,
  Clock,
  Navigation2,
  Store,
  ChevronRight,
  ShieldCheck,
  History,
  AlertCircle,
} from 'lucide-react';

export function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recentAiSearches, setRecentAiSearches] = useState([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');
  const [activeDirectionsPharmacy, setActiveDirectionsPharmacy] = useState(null);

  // Dynamic user location
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  const loadData = useCallback(async (coords = null) => {
    setIsLoading(true);
    try {
      const historyPromise = api.get('/ai/history');
      const pharmUrl = coords
        ? `/pharmacies/nearby?lat=${coords.lat}&lng=${coords.lng}&radius=50`
        : `/pharmacies/nearby?radius=50`;

      const [historyRes, pharmRes] = await Promise.all([
        historyPromise,
        api.get(pharmUrl),
      ]);

      if (historyRes.success) {
        setRecentAiSearches(historyRes.data.slice(0, 4));
      }
      if (pharmRes.success) {
        setNearbyPharmacies(pharmRes.data.slice(0, 4));
      }
    } catch (err) {
      console.warn('Dashboard fetch warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestGps = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      loadData(null);
      return;
    }

    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setLocationStatus('granted');
        loadData(coords);
      },
      (err) => {
        console.warn('Geolocation denied/unavailable in dashboard:', err.message);
        setUserLocation(null);
        setLocationStatus('denied');
        loadData(null);
      },
      { timeout: 8000 }
    );
  }, [loadData]);

  useEffect(() => {
    requestGps();
  }, [requestGps]);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(quickQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-emerald-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Patient Portal • Live Medicine Access
              </span>
              {locationStatus === 'granted' && userLocation && (
                <span className="text-[11px] font-semibold bg-emerald-700/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GPS Active: {userLocation.lat.toFixed(2)}°, {userLocation.lng.toFixed(2)}°
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black mt-2 leading-tight">
              Welcome back, {user?.name || 'Patient'}!
            </h1>
            <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
              Find medicines across network pharmacies, check exact stock counts, and navigate directly with Google Maps.
            </p>

            {/* Quick search form */}
            <form onSubmit={handleQuickSearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Quick search (e.g. Paracetamol, Dolo)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-slate-400 font-medium"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm rounded-xl transition-all shadow"
              >
                Search Stock
              </button>
            </form>
          </div>
        </div>

        {/* 2-Column Section: Nearby Stores & Recent AI Searches */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Nearby Stores (2 cols wide) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Nearby Local Pharmacies</h2>
              </div>
              <Link
                to="/pharmacies"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View All Stores <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nearbyPharmacies.map((pharmacy) => (
                <PharmacyCard
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  onOpenDirections={(p) => setActiveDirectionsPharmacy(p)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Recent Search & AI History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Recent AI Queries</h2>
              </div>
              <Link
                to="/ai-history"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Full History <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              {recentAiSearches.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No previous searches. Try asking the AI in plain English!
                </p>
              ) : (
                recentAiSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/search?ai=true&q=${encodeURIComponent(item.raw_prompt)}`)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/60 transition-colors group"
                  >
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 line-clamp-1">
                      "{item.raw_prompt}"
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-emerald-600">
                        {item.medicine_name || 'Generic terms'}
                      </span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
              )}

              <Link
                to="/search?ai=true"
                className="w-full mt-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>New Natural Language Search</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <MapDirectionsModal
        isOpen={Boolean(activeDirectionsPharmacy)}
        pharmacy={activeDirectionsPharmacy}
        userLocation={userLocation}
        onClose={() => setActiveDirectionsPharmacy(null)}
      />
    </div>
  );
}

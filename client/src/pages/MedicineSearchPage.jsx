import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { supabase } from '../lib/supabase.js';
import { MedicineCard } from '../components/MedicineCard.jsx';
import { PharmacyCard } from '../components/PharmacyCard.jsx';
import { MapDirectionsModal } from '../components/MapDirectionsModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Search,
  Sparkles,
  MapPin,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Navigation2,
  Store,
  Pill,
  Compass,
} from 'lucide-react';

export function MedicineSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const initialQuery = searchParams.get('q') || '';
  const initialIsAi = searchParams.get('ai') === 'true';

  const [query, setQuery] = useState(initialQuery);
  const [isAiMode, setIsAiMode] = useState(initialIsAi);
  const [category, setCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in_stock', 'low_stock'

  // Dynamic Browser Geolocation & Manual City Fallback States
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle', 'locating', 'granted', 'denied'
  const [manualCity, setManualCity] = useState('');
  const [manualCityInput, setManualCityInput] = useState('');
  const [geocodedArea, setGeocodedArea] = useState(null);

  // Data states
  const [isLoading, setIsLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [activeDirectionsPharmacy, setActiveDirectionsPharmacy] = useState(null);

  const categories = [
    'All Categories',
    'Analgesic / Antipyretic',
    'Antibiotic',
    'NSAID / Anti-inflammatory',
    'Antidiabetic',
    'Antihistamine / Allergy',
    'Antacid / PPI',
    'Lipid-lowering / Statin',
    'Antihypertensive',
    'Bronchodilator / Asthma',
  ];

  // Request browser geolocation dynamically
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      showToast('Geolocation is not supported by your browser. Please enter your city manually.', 'error');
      return;
    }

    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus('granted');
        setManualCity('');
        setGeocodedArea(null);
        showToast('Browser location acquired! Showing nearby pharmacies by exact distance.', 'success');
      },
      (err) => {
        console.warn('Geolocation permission denied or unavailable:', err.message);
        setUserLocation(null);
        setLocationStatus('denied');
        showToast('Location permission denied. You can enter your city or area manually below.', 'info');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [showToast]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Execute Search
  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    setAiAnalysis(null);

    try {
      if (isAiMode && query.trim()) {
        // AI Natural Language Search
        const payload = {
          prompt: query.trim(),
          lat: userLocation?.lat,
          lng: userLocation?.lng,
          city: !userLocation ? manualCity : undefined,
        };

        const res = await api.post('/ai/medicine-search', payload);
        if (res.success) {
          setAiAnalysis(res.ai_analysis);
          setMedicines(res.medicines || []);
          setPharmacies(res.pharmacies || []);
        }
      } else {
        // Standard Search
        const queryParams = new URLSearchParams();
        if (query.trim()) queryParams.set('q', query.trim());
        if (category && category !== 'All Categories') queryParams.set('category', category);

        // Fetch medicines
        const medsRes = await api.get(`/medicines/search?${queryParams.toString()}`);
        setMedicines(medsRes.data || []);

        // Fetch nearby pharmacies dynamically
        const pharmParams = new URLSearchParams();
        if (userLocation) {
          pharmParams.set('lat', userLocation.lat);
          pharmParams.set('lng', userLocation.lng);
        } else if (manualCity) {
          pharmParams.set('city', manualCity);
        }
        if (query.trim()) pharmParams.set('q', query.trim());

        const pharmRes = await api.get(`/pharmacies/nearby?${pharmParams.toString()}`);
        if (pharmRes.success) {
          setPharmacies(pharmRes.data || []);
          if (pharmRes.geocoded_area) {
            setGeocodedArea(pharmRes.geocoded_area);
          }
        }
      }
    } catch (err) {
      showToast(err.message || 'Error executing search', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAiMode, query, category, userLocation, manualCity, showToast]);

  // Trigger search when query or location changes
  useEffect(() => {
    if (locationStatus === 'granted' || locationStatus === 'denied' || manualCity) {
      executeSearch();
    }
  }, [userLocation, locationStatus, manualCity, executeSearch]);

  // Supabase Realtime Listener for live stock updates
  useEffect(() => {
    const channel = supabase
      .channel('public:inventory_changes_search')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          console.log('⚡ Realtime Inventory Update Received:', payload);
          showToast('Live stock updated from pharmacy network!', 'info');
          executeSearch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [executeSearch, showToast]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query, ...(isAiMode && { ai: 'true' }) });
    executeSearch();
  };

  const handleManualCitySubmit = (e) => {
    e.preventDefault();
    const clean = manualCityInput.trim();
    if (!clean) return;
    setManualCity(clean);
    setUserLocation(null);
    showToast(`Searching pharmacies near "${clean}"...`, 'info');
  };

  // Filtered pharmacies
  const displayedPharmacies = pharmacies.filter((p) => {
    if (stockFilter === 'in_stock') {
      return (p.matched_inventory || []).some((i) => i.status === 'In Stock');
    }
    if (stockFilter === 'low_stock') {
      return (p.matched_inventory || []).some((i) => i.status === 'Low Stock');
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Medicine Availability Finder
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Search real-time stock across pharmacies with dynamic GPS or manual city proximity
            </p>
          </div>

          {/* Location Mode Toggle / Status Badge */}
          <div className="flex items-center gap-2">
            {locationStatus === 'granted' && userLocation && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  GPS: {userLocation.lat.toFixed(3)}°, {userLocation.lng.toFixed(3)}°
                </span>
              </div>
            )}

            {manualCity && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>{geocodedArea ? geocodedArea.split(',')[0] : manualCity}</span>
              </div>
            )}

            <button
              onClick={detectLocation}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <Navigation2
                className={`w-4 h-4 text-emerald-600 ${
                  locationStatus === 'locating' ? 'animate-spin' : ''
                }`}
              />
              <span>
                {locationStatus === 'locating'
                  ? 'Requesting GPS...'
                  : locationStatus === 'granted'
                  ? 'Refresh GPS'
                  : 'Use Browser GPS'}
              </span>
            </button>
          </div>
        </div>

        {/* Manual Location Fallback Banner (when GPS is denied or manual search requested) */}
        {locationStatus === 'denied' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Location Permission Denied or Unavailable</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Enter your city or district below to calculate distance to nearby pharmacies.
                </p>
              </div>
            </div>

            <form onSubmit={handleManualCitySubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={manualCityInput}
                onChange={(e) => setManualCityInput(e.target.value)}
                placeholder="Enter city (e.g. Rajampet, Austin, London)..."
                className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-full sm:w-64"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Set Location
              </button>
            </form>
          </div>
        )}

        {/* Search Control Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
          {/* AI Toggle Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAiMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  !isAiMode
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Standard Search
              </button>
              <button
                type="button"
                onClick={() => setIsAiMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isAiMode
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gemini AI Search
              </button>
            </div>

            {isAiMode && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Natural Language Medicine Query
              </span>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {isAiMode ? (
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Search className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isAiMode
                    ? 'Ask in plain English: "I have high fever and headache, what is in stock?"'
                    : 'Search by medicine name, chemical or brand (e.g. Paracetamol, Dolo, Amoxicillin)...'
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>

            {/* Category Filter */}
            {!isAiMode && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c === 'All Categories' ? '' : c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Stock</span>
                </>
              )}
            </button>
          </form>

          {/* Stock Filter Pills */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Filter Stock:</span>
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  stockFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('in_stock')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  stockFilter === 'in_stock'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                In Stock Only
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('low_stock')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  stockFilter === 'low_stock'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Low Stock
              </button>
            </div>

            <div className="text-slate-400 font-medium">
              Showing {displayedPharmacies.length} pharmacies • {medicines.length} medicines
            </div>
          </div>
        </div>

        {/* AI Analysis Insight Banner */}
        {aiAnalysis && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-lg border border-emerald-700">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-bold text-base text-white">Gemini AI Entity Extraction</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/20 text-emerald-100">
                    Source: {aiAnalysis.source || 'gemini_api'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-white/10 p-2.5 rounded-lg">
                    <p className="text-emerald-300 uppercase tracking-wider text-[10px] font-bold">Identified Medicine</p>
                    <p className="font-semibold text-white mt-0.5">{aiAnalysis.medicine_name || 'Generic lookup'}</p>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-lg">
                    <p className="text-emerald-300 uppercase tracking-wider text-[10px] font-bold">Generic Compound</p>
                    <p className="font-semibold text-white mt-0.5">{aiAnalysis.generic_name || 'Active ingredient'}</p>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-lg">
                    <p className="text-emerald-300 uppercase tracking-wider text-[10px] font-bold">Search Terms</p>
                    <p className="font-semibold text-white mt-0.5 truncate">
                      {Array.isArray(aiAnalysis.search_terms) ? aiAnalysis.search_terms.join(', ') : 'N/A'}
                    </p>
                  </div>
                </div>
                {aiAnalysis.safety_disclaimer && (
                  <p className="text-[11px] text-emerald-200/90 pt-1 leading-relaxed italic border-t border-white/10">
                    {aiAnalysis.safety_disclaimer}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Checking inventory across pharmacy network...</p>
            <p className="text-xs text-slate-400 mt-1">Connecting to Supabase PostgreSQL & calculating distances</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 1. Pharmacies with Live Stock */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Nearby Pharmacies with Stock
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {displayedPharmacies.length} locations available
                </span>
              </div>

              {displayedPharmacies.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700">No matching pharmacy stock found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Try searching for common medicines like "Paracetamol", "Amoxicillin", or "Ibuprofen", or remove stock status filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedPharmacies.map((pharmacy) => (
                    <PharmacyCard
                      key={pharmacy.id}
                      pharmacy={pharmacy}
                      searchedMedicineName={aiAnalysis?.medicine_name || query}
                      onOpenDirections={(p) => setActiveDirectionsPharmacy(p)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 2. Catalog Medicines Matching Query */}
            {medicines.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Matching Catalog Medicines ({medicines.length})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {medicines.map((med) => (
                    <MedicineCard key={med.id} medicine={med} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Google Directions Modal */}
      <MapDirectionsModal
        isOpen={Boolean(activeDirectionsPharmacy)}
        pharmacy={activeDirectionsPharmacy}
        userLocation={userLocation}
        onClose={() => setActiveDirectionsPharmacy(null)}
      />
    </div>
  );
}

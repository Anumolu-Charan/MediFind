import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';
import { PharmacyCard } from '../components/PharmacyCard.jsx';
import { MapDirectionsModal } from '../components/MapDirectionsModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Store,
  Search,
  Navigation2,
  Loader2,
  AlertCircle,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

export function PharmaciesDirectoryPage() {
  const { showToast } = useToast();

  const [pharmacies, setPharmacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamic Location states
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle', 'locating', 'granted', 'denied'
  const [manualCity, setManualCity] = useState('');
  const [manualCityInput, setManualCityInput] = useState('');
  const [geocodedArea, setGeocodedArea] = useState(null);

  const [activeDirectionsPharmacy, setActiveDirectionsPharmacy] = useState(null);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      showToast('Geolocation is not supported by your browser. Please enter your city manually.', 'info');
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
        showToast('Browser location active! Proximity calculated dynamically.', 'success');
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setUserLocation(null);
        setLocationStatus('denied');
        showToast('Location permission denied. Enter your city or area to calculate distances.', 'info');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [showToast]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const fetchPharmacies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (userLocation) {
        params.set('lat', userLocation.lat);
        params.set('lng', userLocation.lng);
      } else if (manualCity) {
        params.set('city', manualCity);
      }

      const res = await api.get(`/pharmacies/nearby?${params.toString()}`);
      if (res.success) {
        setPharmacies(res.data || []);
        if (res.geocoded_area) {
          setGeocodedArea(res.geocoded_area);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load pharmacies', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, manualCity, showToast]);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  const handleManualCitySubmit = (e) => {
    e.preventDefault();
    const clean = manualCityInput.trim();
    if (!clean) return;
    setManualCity(clean);
    setUserLocation(null);
    showToast(`Calculating proximity for "${clean}"...`, 'info');
  };

  const filteredPharmacies = pharmacies.filter((p) => {
    const name = p.name.toLowerCase();
    const address = p.address.toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || address.includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Store className="w-8 h-8 text-emerald-600" />
              <span>Registered Network Pharmacies</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse pharmacies, check opening hours, contact details, and calculate proximity dynamically
            </p>
          </div>

          <div className="flex items-center gap-2">
            {locationStatus === 'granted' && userLocation && (
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                GPS: {userLocation.lat.toFixed(2)}°, {userLocation.lng.toFixed(2)}°
              </span>
            )}

            {manualCity && (
              <span className="text-xs font-semibold bg-sky-50 text-sky-800 px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                {geocodedArea ? geocodedArea.split(',')[0] : manualCity}
              </span>
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

        {/* Manual City Fallback Banner if location denied */}
        {locationStatus === 'denied' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Location Permission Denied or Unavailable</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Enter your city below to calculate distance from your area:
                </p>
              </div>
            </div>

            <form onSubmit={handleManualCitySubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={manualCityInput}
                onChange={(e) => setManualCityInput(e.target.value)}
                placeholder="Enter city (e.g. Rajampet, Austin)..."
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

        {/* Search Input */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by pharmacy name or address..."
            className="w-full text-sm font-medium focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Pharmacies Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-semibold">Loading verified pharmacies...</p>
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">No pharmacies found</p>
            <p className="text-xs text-slate-500 mt-1">Try broadening your search term or entering another city.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPharmacies.map((pharmacy) => (
              <PharmacyCard
                key={pharmacy.id}
                pharmacy={pharmacy}
                onOpenDirections={(p) => setActiveDirectionsPharmacy(p)}
              />
            ))}
          </div>
        )}
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

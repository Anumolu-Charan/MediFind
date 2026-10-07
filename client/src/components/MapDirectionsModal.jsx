import React from 'react';
import { X, Navigation, MapPin, Phone, Clock, ExternalLink } from 'lucide-react';

export function MapDirectionsModal({ isOpen, onClose, pharmacy, userLocation }) {
  if (!isOpen || !pharmacy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{pharmacy.name}</h3>
              <p className="text-emerald-100 text-sm">Pharmacy Directions & Contact</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Distance and Estimated Time Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Distance</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {pharmacy.distance_display || (pharmacy.distance_km ? `${pharmacy.distance_km} km` : 'Local Area')}
              </p>
            </div>
            <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-100 text-center">
              <p className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Est. Travel Time</p>
              <p className="text-2xl font-black text-sky-700 mt-1">
                {pharmacy.estimated_travel_time_mins ? `~${pharmacy.estimated_travel_time_mins} min` : '~15 min'}
              </p>
            </div>
          </div>

          {/* Pharmacy details */}
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Address</p>
                <p className="text-slate-600 mt-0.5">{pharmacy.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Phone</p>
                <a href={`tel:${pharmacy.phone}`} className="text-emerald-600 hover:underline">
                  {pharmacy.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Operating Hours</p>
                <p className="text-slate-600">{pharmacy.opening_hours || '8:00 AM - 10:00 PM'}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={pharmacy.directions_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name + ' ' + pharmacy.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg shadow-emerald-600/20"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Google Maps
            </a>
            <button
              onClick={onClose}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

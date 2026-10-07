import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Navigation, ExternalLink, ChevronRight, Store } from 'lucide-react';
import { StockBadge } from './StockBadge.jsx';

export function PharmacyCard({ pharmacy, onOpenDirections, searchedMedicineName }) {
  const matchedInventory = pharmacy.matched_inventory || [];
  const primaryItem = matchedInventory[0];

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const diffMins = Math.floor((new Date() - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Name, Distance & Demo Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                {pharmacy.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[220px]">{pharmacy.address}</span>
              </p>
            </div>
          </div>

          {/* Distance Tag */}
          <div className="text-right shrink-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {pharmacy.distance_display || (pharmacy.distance_km ? `${pharmacy.distance_km} km` : 'Local')}
            </span>
            {pharmacy.estimated_travel_time_mins && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                ~{pharmacy.estimated_travel_time_mins} min drive
              </p>
            )}
          </div>
        </div>

        {/* Medicine Inventory Match Banner */}
        {primaryItem ? (
          <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs">
                <span className="font-bold text-slate-800">
                  {primaryItem.medicines?.name || searchedMedicineName || 'Medicine'}
                </span>
                <span className="text-slate-500 ml-1">
                  ({primaryItem.medicines?.strength || 'standard'})
                </span>
              </div>
              <StockBadge status={primaryItem.status} quantity={primaryItem.quantity} />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">
                Price: ${Number(primaryItem.price || 0).toFixed(2)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Updated {formatTimeAgo(primaryItem.updated_at)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 flex items-center justify-between">
            <span>Inventory catalog available</span>
            <span className="text-emerald-700 font-semibold">{pharmacy.total_medicines || 0} medicines</span>
          </div>
        )}

        {/* Details: Phone & Hours */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a href={`tel:${pharmacy.phone}`} className="text-slate-700 hover:text-emerald-600 hover:underline">
              {pharmacy.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{pharmacy.opening_hours || '8:00 AM - 10:00 PM'}</span>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDirections && onOpenDirections(pharmacy)}
          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
          Directions
        </button>

        <Link
          to={`/pharmacies/${pharmacy.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform"
        >
          View Store
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

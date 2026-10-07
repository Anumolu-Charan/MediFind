import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Building2, ShieldAlert, ChevronRight, Store } from 'lucide-react';
import { StockBadge } from './StockBadge.jsx';

export function MedicineCard({ medicine }) {
  const inventoryList = medicine.inventory || [];
  const inStockPharmacies = inventoryList.filter((i) => i.status === 'In Stock');
  const lowStockPharmacies = inventoryList.filter((i) => i.status === 'Low Stock');

  let overallStatus = 'Out of Stock';
  if (inStockPharmacies.length > 0) overallStatus = 'In Stock';
  else if (lowStockPharmacies.length > 0) overallStatus = 'Low Stock';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {medicine.category}
          </span>
          <StockBadge
            status={overallStatus}
            quantity={inStockPharmacies.length > 0 ? `${inStockPharmacies.length} stores` : undefined}
          />
        </div>

        {/* Medicine Name & Strength */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Pill className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
              {medicine.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {medicine.generic_name} • {medicine.strength}
            </p>
          </div>
        </div>

        {/* Description or details */}
        {medicine.description && (
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {medicine.description}
          </p>
        )}

        {/* Manufacturer and prescription tag */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{medicine.manufacturer}</span>
          </div>
          {medicine.requires_prescription && (
            <span className="flex items-center gap-1 text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
              <ShieldAlert className="w-3 h-3" />
              Rx Required
            </span>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
          <Store className="w-3.5 h-3.5 text-slate-400" />
          <span>{inventoryList.length} Network Pharmacies</span>
        </div>

        <Link
          to={`/search?medicine_id=${medicine.id}&q=${encodeURIComponent(medicine.name)}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform"
        >
          Check Stores
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

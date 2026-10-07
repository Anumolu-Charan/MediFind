import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { supabase } from '../lib/supabase.js';
import { StockBadge } from '../components/StockBadge.jsx';
import { MapDirectionsModal } from '../components/MapDirectionsModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Pill,
  Search,
  Filter,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export function PharmacyDetailsPage() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [pharmacy, setPharmacy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);

  const fetchPharmacy = useCallback(async () => {
    try {
      const res = await api.get(`/pharmacies/${id}`);
      if (res.success) {
        setPharmacy(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load pharmacy details', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchPharmacy();
  }, [fetchPharmacy]);

  // Realtime subscription for inventory updates for this pharmacy
  useEffect(() => {
    const channel = supabase
      .channel(`pharmacy-${id}-inventory`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `pharmacy_id=eq.${id}`,
        },
        (payload) => {
          console.log('⚡ Realtime pharmacy inventory change:', payload);
          showToast('Pharmacy inventory refreshed live!', 'info');
          fetchPharmacy();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchPharmacy, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-semibold">Loading pharmacy profile and inventory...</p>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Pharmacy Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          The requested pharmacy could not be found or has been removed.
        </p>
        <Link
          to="/pharmacies"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
      </div>
    );
  }

  const inventoryList = pharmacy.inventory || [];
  const filteredInventory = inventoryList.filter((item) => {
    const medName = item.medicines?.name?.toLowerCase() || '';
    const generic = item.medicines?.generic_name?.toLowerCase() || '';
    const search = filterText.toLowerCase();

    const matchesSearch = medName.includes(search) || generic.includes(search);
    if (!matchesSearch) return false;

    if (statusFilter === 'in_stock') return item.status === 'In Stock';
    if (statusFilter === 'low_stock') return item.status === 'Low Stock';
    if (statusFilter === 'out_of_stock') return item.status === 'Out of Stock';

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          to="/pharmacies"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Pharmacies
        </Link>

        {/* Pharmacy Profile Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {pharmacy.name}
                  </h1>
                  {pharmacy.is_demo && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Verified Network Pharmacy
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-sm text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pharmacy.address}</span>
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${pharmacy.phone}`} className="hover:text-emerald-600 hover:underline">
                      {pharmacy.phone}
                    </a>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pharmacy.opening_hours || '8:00 AM - 10:00 PM'}</span>
                  </span>
                  {pharmacy.license_number && (
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lic: {pharmacy.license_number}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsDirectionsOpen(true)}
                className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Inventory Catalog */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                <span>Available Medicines & Realtime Stock</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time stock numbers updated directly by the pharmacy team
              </p>
            </div>

            {/* Filter Search */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter stock by name..."
                  className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Table / List */}
          {filteredInventory.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium">No medicines match your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Medicine Name</th>
                    <th className="py-3 px-4">Dosage / Strength</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const med = item.medicines;
                    if (!med) return null;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{med.name}</div>
                          <div className="text-xs text-slate-500 font-normal">{med.generic_name}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {med.dosage_form} • {med.strength}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {med.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          ${Number(item.price || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StockBadge status={item.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                          {item.quantity} units
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Directions Modal */}
      <MapDirectionsModal
        isOpen={isDirectionsOpen}
        pharmacy={pharmacy}
        onClose={() => setIsDirectionsOpen(false)}
      />
    </div>
  );
}

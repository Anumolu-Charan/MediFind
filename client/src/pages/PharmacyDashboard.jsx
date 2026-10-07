import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { supabase } from '../lib/supabase.js';
import { StockBadge } from '../components/StockBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Store,
  Boxes,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  TrendingUp,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';

export function PharmacyDashboard() {
  const { user, pharmacy } = useAuth();
  const { showToast } = useToast();

  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPharmacyInventory = useCallback(async () => {
    if (!pharmacy) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get(`/inventory?pharmacy_id=${pharmacy.id}`);
      if (res.success) {
        setInventory(res.data || []);
      }
    } catch (err) {
      console.warn('Inventory fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [pharmacy]);

  useEffect(() => {
    fetchPharmacyInventory();
  }, [fetchPharmacyInventory]);

  // Realtime subscription for this pharmacy
  useEffect(() => {
    if (!pharmacy?.id) return;

    const channel = supabase
      .channel(`pharmacy-dash-${pharmacy.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `pharmacy_id=eq.${pharmacy.id}`,
        },
        () => {
          fetchPharmacyInventory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pharmacy?.id, fetchPharmacyInventory]);

  const inStockCount = inventory.filter((i) => i.status === 'In Stock').length;
  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter((i) => i.status === 'Out of Stock').length;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-semibold">Loading pharmacy console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Pharmacy Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Store className="w-8 h-8 text-teal-200" />
            </div>
            <div>
              <span className="text-teal-300 font-bold uppercase tracking-wider text-xs">
                Pharmacy Management Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-1 leading-tight">
                {pharmacy?.name || 'Your Pharmacy Store'}
              </h1>
              <p className="text-teal-100 text-xs sm:text-sm mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-300 shrink-0" />
                <span>{pharmacy?.address || 'Address pending setup'}</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-teal-200">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {pharmacy?.phone || 'No phone'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {pharmacy?.opening_hours || '8:00 AM - 10:00 PM'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/pharmacy/inventory"
              className="py-3 px-5 bg-white text-teal-900 hover:bg-teal-50 font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <Boxes className="w-4 h-4" />
              <span>Manage Inventory</span>
            </Link>
            <Link
              to="/profile"
              className="py-3 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Edit Store Profile
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Medicines</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{inventory.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Boxes className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">In Stock</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{inStockCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Low Stock</p>
              <p className="text-2xl font-black text-amber-700 mt-1">{lowStockCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-black text-rose-700 mt-1">{outOfStockCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent Inventory Items Table Preview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current Medicine Stock Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Changes here are synced directly via Supabase Realtime to patients searching online
              </p>
            </div>

            <Link
              to="/pharmacy/inventory"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Full Inventory Management <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {inventory.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">Your store has no medicines registered yet.</p>
              <Link
                to="/pharmacy/inventory"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                <Plus className="w-4 h-4" /> Add Medicines
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Medicine</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.slice(0, 8).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{item.medicines?.name}</span>
                        <span className="text-xs text-slate-500 block">{item.medicines?.strength}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{item.medicines?.category}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">${Number(item.price || 0).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <StockBadge status={item.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

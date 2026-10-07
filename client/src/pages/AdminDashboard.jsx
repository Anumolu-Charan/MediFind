import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  ShieldCheck,
  Users,
  Store,
  Pill,
  Boxes,
  Sparkles,
  Trash2,
  Plus,
  Loader2,
  Activity,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';

export function AdminDashboard() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'medicines', 'activity'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Medicine Modal
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [medGeneric, setMedGeneric] = useState('');
  const [medStrength, setMedStrength] = useState('500mg');
  const [medDosage, setMedDosage] = useState('Tablet');
  const [medCategory, setMedCategory] = useState('Analgesic / Antipyretic');
  const [medManufacturer, setMedManufacturer] = useState('');
  const [medDescription, setMedDescription] = useState('');
  const [isSavingMed, setIsSavingMed] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const [statsRes, usersRes, medsRes, actRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/medicines'),
        api.get('/admin/activity'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsersList(usersRes.data || []);
      if (medsRes.success) setMedicinesList(medsRes.data || []);
      if (actRes.success) setActivity(actRes.data || null);
    } catch (err) {
      showToast(err.message || 'Failed to load admin telemetry', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Delete User
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user account "${name}"?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      showToast('User account deleted.', 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // Delete Medicine
  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete medicine "${name}" from catalog?`)) return;
    try {
      await api.delete(`/medicines/${id}`);
      showToast('Medicine removed from catalog.', 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to delete medicine', 'error');
    }
  };

  // Add Medicine
  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    try {
      setIsSavingMed(true);
      await api.post('/medicines', {
        name: medName,
        generic_name: medGeneric,
        strength: medStrength,
        dosage_form: medDosage,
        category: medCategory,
        manufacturer: medManufacturer,
        description: medDescription,
        requires_prescription: false,
      });

      showToast('Medicine added to central catalog!', 'success');
      setIsAddMedOpen(false);
      // Reset form
      setMedName('');
      setMedGeneric('');
      setMedManufacturer('');
      setMedDescription('');
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to add medicine', 'error');
    } finally {
      setIsSavingMed(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-3" />
        <p className="text-sm font-semibold">Loading Admin Command Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <ShieldCheck className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <span className="text-purple-300 font-bold uppercase tracking-wider text-xs">
                Master Control Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-1 leading-tight">
                System Administration
              </h1>
              <p className="text-purple-200 text-xs sm:text-sm mt-1">
                Oversee users, pharmacy networks, medicine catalog, and live inventory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddMedOpen(true)}
              className="py-3 px-5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Catalog Medicine</span>
            </button>
          </div>
        </div>

        {/* 5 Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.total_users}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pharmacies</span>
                <Store className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.total_pharmacies}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Medicines</span>
                <Pill className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.total_medicines}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Inventory</span>
                <Boxes className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.total_inventory_items}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">AI Queries</span>
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.total_ai_searches}</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Stock Telemetry', icon: Activity },
            { id: 'users', label: `Users Management (${usersList.length})`, icon: Users },
            { id: 'medicines', label: `Medicine Catalog (${medicinesList.length})`, icon: Pill },
            { id: 'activity', label: 'Recent Activity Logs', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Stock Telemetry */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Network Inventory Distribution</h3>
              <p className="text-xs text-slate-500">Live breakdown of medicine stock across registered stores</p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-700">In Stock: {stats.stock_breakdown.in_stock} items</span>
                    <span className="text-slate-400">
                      {Math.round((stats.stock_breakdown.in_stock / Math.max(1, stats.total_inventory_items)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${(stats.stock_breakdown.in_stock / Math.max(1, stats.total_inventory_items)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-700">Low Stock: {stats.stock_breakdown.low_stock} items</span>
                    <span className="text-slate-400">
                      {Math.round((stats.stock_breakdown.low_stock / Math.max(1, stats.total_inventory_items)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${(stats.stock_breakdown.low_stock / Math.max(1, stats.total_inventory_items)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-700">Out of Stock: {stats.stock_breakdown.out_of_stock} items</span>
                    <span className="text-slate-400">
                      {Math.round((stats.stock_breakdown.out_of_stock / Math.max(1, stats.total_inventory_items)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{
                        width: `${(stats.stock_breakdown.out_of_stock / Math.max(1, stats.total_inventory_items)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">System Health</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span>Supabase PostgreSQL</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span>Supabase Realtime Channel</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span>Google Gemini AI</span>
                  <span className="font-bold text-purple-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span>Google Maps Geocoding</span>
                  <span className="font-bold text-teal-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Enabled (Haversine fallback)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden">
            <h3 className="font-bold text-slate-900 text-base mb-4">Registered Platform Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Associated Pharmacy</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'pharmacy'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {u.pharmacies?.name || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Medicine Catalog */}
        {activeTab === 'medicines' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Standard Medicines Catalog</h3>
              <button
                onClick={() => setIsAddMedOpen(true)}
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Name / Generic</th>
                    <th className="py-3 px-4">Form & Strength</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Manufacturer</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicinesList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.generic_name}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {m.dosage_form} • {m.strength}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{m.manufacturer}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteMedicine(m.id, m.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Activity Logs */}
        {activeTab === 'activity' && activity && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-teal-600" /> Recent Inventory Updates
              </h3>
              <div className="space-y-3">
                {activity.recent_inventory_updates?.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{item.medicines?.name}</span>
                      <span className="font-mono">{item.quantity} units ({item.status})</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 mt-1">
                      <span>{item.pharmacies?.name}</span>
                      <span>{new Date(item.updated_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Recent AI Natural Language Queries
              </h3>
              <div className="space-y-3">
                {activity.recent_ai_searches?.map((query) => (
                  <div key={query.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-bold text-slate-800">"{query.raw_prompt}"</p>
                    <div className="flex items-center justify-between text-slate-400 mt-1">
                      <span className="text-emerald-600 font-semibold">{query.medicine_name || 'Generic terms'}</span>
                      <span>{new Date(query.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {isAddMedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Add New Medicine to Catalog</h3>
              <button
                onClick={() => setIsAddMedOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    required
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    required
                    value={medGeneric}
                    onChange={(e) => setMedGeneric(e.target.value)}
                    placeholder="e.g. Acetaminophen"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Strength
                  </label>
                  <input
                    type="text"
                    required
                    value={medStrength}
                    onChange={(e) => setMedStrength(e.target.value)}
                    placeholder="500mg"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dosage Form
                  </label>
                  <input
                    type="text"
                    required
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="Tablet / Syrup"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    placeholder="Analgesic / Antibiotic"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    required
                    value={medManufacturer}
                    onChange={(e) => setMedManufacturer(e.target.value)}
                    placeholder="e.g. Pfizer / Cipla"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={medDescription}
                  onChange={(e) => setMedDescription(e.target.value)}
                  placeholder="Medical indication and usage..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddMedOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMed}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSavingMed && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

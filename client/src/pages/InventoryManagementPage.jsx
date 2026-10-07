import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { supabase } from '../lib/supabase.js';
import { StockBadge } from '../components/StockBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

export function InventoryManagementPage() {
  const { user, pharmacy } = useAuth();
  const { showToast } = useToast();

  const [inventory, setInventory] = useState([]);
  const [catalogMedicines, setCatalogMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [formMedicineId, setFormMedicineId] = useState('');
  const [formQuantity, setFormQuantity] = useState(20);
  const [formPrice, setFormPrice] = useState(25);
  const [formStatus, setFormStatus] = useState('In Stock');
  const [isSaving, setIsSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!pharmacy?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get(`/inventory?pharmacy_id=${pharmacy.id}`);
      if (res.success) {
        setInventory(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [pharmacy?.id, showToast]);

  const fetchCatalogMedicines = useCallback(async () => {
    try {
      const res = await api.get('/medicines');
      if (res.success) {
        setCatalogMedicines(res.data || []);
      }
    } catch (err) {
      console.warn('Failed to load medicines catalog:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchCatalogMedicines();
  }, [fetchInventory, fetchCatalogMedicines]);

  // Realtime synchronization for inventory
  useEffect(() => {
    if (!pharmacy?.id) return;

    const channel = supabase
      .channel(`realtime-inventory-${pharmacy.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `pharmacy_id=eq.${pharmacy.id}`,
        },
        () => {
          fetchInventory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pharmacy?.id, fetchInventory]);

  // Handle Add Item
  const handleOpenAdd = () => {
    setFormMedicineId(catalogMedicines[0]?.id || '');
    setFormQuantity(25);
    setFormPrice(30);
    setFormStatus('In Stock');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formMedicineId) {
      showToast('Please select a medicine', 'error');
      return;
    }

    try {
      setIsSaving(true);
      await api.post('/inventory', {
        pharmacy_id: pharmacy.id,
        medicine_id: formMedicineId,
        quantity: parseInt(formQuantity, 10),
        price: parseFloat(formPrice),
        status: formStatus,
      });

      showToast('Medicine added to inventory successfully! Realtime broadcast sent.', 'success');
      setIsAddModalOpen(false);
      fetchInventory();
    } catch (err) {
      showToast(err.message || 'Failed to add item', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Edit Item
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormQuantity(item.quantity);
    setFormPrice(item.price);
    setFormStatus(item.status);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setIsSaving(true);
      await api.put(`/inventory/${selectedItem.id}`, {
        quantity: parseInt(formQuantity, 10),
        price: parseFloat(formPrice),
        status: formStatus,
      });

      showToast('Stock updated! Patients will see changes immediately in real-time.', 'success');
      setIsEditModalOpen(false);
      fetchInventory();
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Item
  const handleDelete = async (id, medName) => {
    if (!window.confirm(`Are you sure you want to remove "${medName}" from your inventory?`)) {
      return;
    }

    try {
      await api.delete(`/inventory/${id}`);
      showToast('Medicine removed from inventory.', 'success');
      fetchInventory();
    } catch (err) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  // Filtering
  const filteredList = inventory.filter((item) => {
    const name = item.medicines?.name?.toLowerCase() || '';
    const generic = item.medicines?.generic_name?.toLowerCase() || '';
    const term = filterQuery.toLowerCase();

    if (!name.includes(term) && !generic.includes(term)) return false;

    if (statusFilter === 'in_stock') return item.status === 'In Stock';
    if (statusFilter === 'low_stock') return item.status === 'Low Stock';
    if (statusFilter === 'out_of_stock') return item.status === 'Out of Stock';

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Boxes className="w-8 h-8 text-emerald-600" />
              <span>Medicine Inventory Management</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Store: <strong className="text-slate-800">{pharmacy?.name}</strong> • Realtime synchronization enabled
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine to Store</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by brand or generic name..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Status:</span>
            {['all', 'in_stock', 'low_stock', 'out_of_stock'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
              <p className="text-sm font-semibold">Loading current inventory...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No inventory records found</p>
              <p className="text-xs text-slate-400 mt-1">Add items or clear filter parameters to view medicines.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Medicine Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 text-center">Quantity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{item.medicines?.name}</div>
                        <div className="text-xs text-slate-500 font-normal">
                          {item.medicines?.generic_name} • {item.medicines?.strength}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                        {item.medicines?.category}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ${Number(item.price || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StockBadge status={item.status} />
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Stock"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.medicines?.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Add Medicine to Store</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Medicine
                </label>
                <select
                  value={formMedicineId}
                  onChange={(e) => setFormMedicineId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
                >
                  {catalogMedicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.generic_name} - {m.strength})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Stock Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Update Stock</h3>
                <p className="text-xs text-slate-500">{selectedItem.medicines?.name}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFormQuantity(e.target.value);
                      if (val === 0) setFormStatus('Out of Stock');
                      else if (val <= 5) setFormStatus('Low Stock');
                      else setFormStatus('In Stock');
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Stock Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
                ⚡ Realtime broadcast: Once saved, patient searches and store pages update instantly.
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Update Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

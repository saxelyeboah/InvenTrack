import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Truck, Plus, Edit2, Trash2, Phone, Mail, User, RefreshCw } from 'lucide-react';
import SupplierModal from '../components/modals/SupplierModal';
import { useAuth } from '../context/AuthContext';

const Suppliers = () => {
  const { isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch supplier directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSaveSupplier = async (formData) => {
    if (editingSupplier) {
      await api.put(`/suppliers/${editingSupplier.id}`, formData);
    } else {
      await api.post('/suppliers', formData);
    }
    fetchSuppliers();
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm('Are you sure you want to remove this supplier from the directory?')) return;
    try {
      await api.delete(`/suppliers/${supplierId}`);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete supplier');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-5 border border-slate-800/80 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Supplier Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Directory of registered stock vendors and contact information.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingSupplier(null);
              setSupplierModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 p-4 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Supplier Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading supplier records...</div>
      ) : suppliers.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
          No supplier records registered.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl shadow-inner">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{sup.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500">Supplier #{sup.id}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingSupplier(sup);
                        setSupplierModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(sup.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Contact: <strong className="text-slate-200">{sup.contact_person || 'N/A'}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Phone: <strong className="text-slate-200">{sup.phone || 'N/A'}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Email: <strong className="text-sky-400 font-mono">{sup.email || 'N/A'}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SupplierModal
        isOpen={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
      />
    </div>
  );
};

export default Suppliers;

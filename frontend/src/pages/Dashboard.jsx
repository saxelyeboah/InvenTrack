import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Package,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import StockMoveModal from '../components/modals/StockMoveModal';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, prodRes, supRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/products?active_only=true'),
        api.get('/suppliers')
      ]);
      setData(dashRes.data);
      setAllProducts(prodRes.data);
      setSuppliers(supRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStockInClick = (prod) => {
    setSelectedProduct(prod);
    setStockModalOpen(true);
  };

  const handleStockSave = async (moveData) => {
    await api.post('/stock/move', moveData);
    fetchDashboard();
  };

  const filteredLowStockItems = data?.low_stock_items?.filter((item) => {
    if (!selectedCategoryFilter) return true;
    return String(item.category_id) === String(selectedCategoryFilter);
  }) || [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-400">Loading overview dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Top Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-5 border border-slate-800/80 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Overview Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status of inventory counts, total valuation, and low-stock alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 p-4 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Dribbble Style Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Active Products */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Active Products
              </span>
              <div className="text-3xl font-extrabold text-slate-100 tracking-tight">
                {data?.total_active_products || 0}
              </div>
              <p className="text-xs text-slate-400 flex items-center pt-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                <span>Active catalog SKUs</span>
              </p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl shadow-inner">
              <Boxes className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Valuation */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Inventory Valuation
              </span>
              <div className="text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
                GHS {data?.total_stock_valuation || '0.00'}
              </div>
              <p className="text-xs text-slate-400 pt-1">
                Sum of <span className="font-semibold text-slate-300">(Quantity &times; Cost Price)</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Low-Stock Count */}
        <div
          className={`bg-slate-900/80 border rounded-2xl p-5 shadow-lg relative overflow-hidden group transition-all ${
            (data?.low_stock_count || 0) > 0 ? 'border-amber-500/30 bg-amber-950/10' : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Low-Stock Alert Items
              </span>
              <div
                className={`text-3xl font-extrabold tracking-tight ${
                  (data?.low_stock_count || 0) > 0 ? 'text-amber-400' : 'text-slate-100'
                }`}
              >
                {data?.low_stock_count || 0}
              </div>
              <p className="text-xs text-slate-400 pt-1">
                Items requiring restock (&le; Reorder Level)
              </p>
            </div>
            <div
              className={`p-3 rounded-xl border shadow-inner ${
                (data?.low_stock_count || 0) > 0
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Dribbble Style Toolbar & Filter Pills */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Low-Stock Filter Toolbar
            </h3>
          </div>

          {selectedCategoryFilter && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Filters Applied:</span>
              <button
                onClick={() => setSelectedCategoryFilter('')}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sky-950/80 text-sky-300 border border-sky-800 rounded-full text-xs font-medium hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 transition-colors"
              >
                <span>Category Filter Active</span>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Immediate Low-Stock Alert Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Low-Stock Alert Items
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {filteredLowStockItems.length} items flagged
          </span>
        </div>

        {filteredLowStockItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">
            All product stock levels are healthy! No items currently below reorder threshold.
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-80">
            <table className="w-full text-left text-xs text-slate-300 relative">
              <thead className="bg-slate-950 sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 shadow-sm">
                <tr>
                  <th className="px-6 py-3.5">SKU Code</th>
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5 text-center">On-Hand Stock</th>
                  <th className="px-6 py-3.5 text-center">Reorder Threshold</th>
                  <th className="px-6 py-3.5 text-right">Quick Restock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredLowStockItems.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-sky-400">{prod.sku}</td>
                    <td className="px-6 py-4 font-semibold text-slate-100">{prod.name}</td>
                    <td className="px-6 py-4 text-slate-400">{prod.category_name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {prod.quantity_on_hand} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-slate-400 font-medium">
                      {prod.reorder_level} units
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleStockInClick(prod)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-sky-600/20"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Stock In</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StockMoveModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        onSave={handleStockSave}
        products={allProducts}
        suppliers={suppliers}
        initialProduct={selectedProduct}
      />
    </div>
  );
};

export default Dashboard;

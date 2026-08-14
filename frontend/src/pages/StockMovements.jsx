import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { ArrowRightLeft, Filter, Plus, RefreshCw, X, Search } from 'lucide-react';
import StockMoveModal from '../components/modals/StockMoveModal';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [movementType, setMovementType] = useState('');
  const [stockModalOpen, setStockModalOpen] = useState(false);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (movementType) params.append('movement_type', movementType);

      const [moveRes, prodRes, supRes] = await Promise.all([
        api.get(`/stock/movements?${params.toString()}`),
        api.get('/products?active_only=true'),
        api.get('/suppliers')
      ]);

      setMovements(moveRes.data);
      setProducts(prodRes.data);
      setSuppliers(supRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch stock movements audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [movementType]);

  const handleStockSave = async (formData) => {
    await api.post('/stock/move', formData);
    fetchMovements();
  };

  // Filter movements by search query (product name or SKU)
  const filteredMovements = movements.filter((move) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (move.product_name && move.product_name.toLowerCase().includes(q)) ||
      (move.product_sku && move.product_sku.toLowerCase().includes(q))
    );
  });

  return (
    <div className="app-page-content flex-1 flex flex-col min-h-0 space-y-5 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-5 border border-slate-800/80 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Stock Movements Audit Log</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log tracking every stock reception, issue, and manual adjustment.
          </p>
        </div>

        <button
          onClick={() => setStockModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record</span>
        </button>
      </div>

      {/* Dribbble Style Toolbar: Search Input + Movement Type Filter */}
      <div className="flex-shrink-0 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Input replacing old product dropdown */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Movement Type Filter */}
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 w-full sm:w-48"
            >
              <option value="">All Movement Types</option>
              <option value="STOCK_IN">STOCK IN (+)</option>
              <option value="STOCK_OUT">STOCK OUT (-)</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
            </select>
          </div>

          <button
            onClick={fetchMovements}
            className="p-2 text-slate-400 hover:text-white bg-slate-950/80 border border-slate-800 rounded-xl transition-colors self-end md:self-auto"
            title="Refresh Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Active Filter Tags */}
        {(searchQuery || movementType) && (
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Filters Applied:
            </span>
            {searchQuery && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 rounded-full">
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {movementType && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-full">
                <span>Type: {movementType}</span>
                <button onClick={() => setMovementType('')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex-shrink-0 bg-rose-950/60 border border-rose-800/80 text-rose-300 p-4 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Audit Log Data Table */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 relative">
            <thead className="bg-slate-950 sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 shadow-sm">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Product Name (SKU)</th>
                <th className="px-6 py-3.5 text-center">Movement Type</th>
                <th className="px-6 py-3.5 text-center">Quantity</th>
                <th className="px-6 py-3.5">Supplier</th>
                <th className="px-6 py-3.5">Performed By</th>
                <th className="px-6 py-3.5">Reason / Audit Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    Loading stock movements audit log...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No stock movement audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((move) => {
                  const dateStr = new Date(move.created_at).toLocaleString();
                  const typeStr = move.movement_type || move.TEXT || 'STOCK_IN';
                  return (
                    <tr key={move.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400">{dateStr}</td>
                      <td className="px-6 py-4 font-semibold text-slate-100">
                        {move.product_name}{' '}
                        <span className="font-mono text-sky-400 font-bold ml-1">({move.product_sku})</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            typeStr === 'STOCK_IN'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : typeStr === 'STOCK_OUT'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {typeStr}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-extrabold text-slate-100 text-sm">
                        {typeStr === 'STOCK_IN' ? '+' : typeStr === 'STOCK_OUT' ? '-' : ''}
                        {move.quantity}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {move.supplier_name ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                            {move.supplier_name}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">{move.user_name}</td>
                      <td className="px-6 py-4 text-slate-400 italic">
                        {move.reason || 'No note recorded'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockMoveModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        onSave={handleStockSave}
        products={products}
        suppliers={suppliers}
      />
    </div>
  );
};

export default StockMovements;

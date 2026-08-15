import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Receipt,
  Tag
} from 'lucide-react';
import ReceiptModal from '../components/modals/ReceiptModal';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products?active_only=true');
      setProducts(res.data);
      if (res.data.length > 0 && !selectedProductId) {
        setSelectedProductId(res.data[0].id);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load products for checkout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    const product = products.find((p) => String(p.id) === String(selectedProductId));
    if (!product) return;

    const existingIndex = cart.findIndex((item) => String(item.product_id) === String(selectedProductId));
    const qtyToAdd = parseInt(quantity, 10);

    const currentCartQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedTotal = currentCartQty + qtyToAdd;

    if (requestedTotal > product.quantity_on_hand) {
      setError(
        `Cannot add ${qtyToAdd} unit(s). Only ${product.quantity_on_hand - currentCartQty} available in stock.`
      );
      return;
    }

    setError('');
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += qtyToAdd;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          sku: product.sku,
          name: product.name,
          unit_price: parseFloat(product.selling_price),
          quantity: qtyToAdd,
          max_available: product.quantity_on_hand,
        },
      ]);
    }
  };

  const handleUpdateCartQty = (productId, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    setCart(
      cart.map((item) => {
        if (item.product_id === productId) {
          if (qty > item.max_available) {
            setError(`Only ${item.max_available} units available for ${item.name}`);
            return item;
          }
          setError('');
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleSubmitSale = async () => {
    if (cart.length === 0) {
      setError('Cart is empty. Please add products to execute sale.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post('/sales', {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });

      setCompletedSale(res.data);
      setCart([]);
      setReceiptModalOpen(true);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to complete sale transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // If searching, display all search results from full catalog; if default, cap at top 9 recently updated items
  const displayedProducts = searchFilter.trim() ? filteredProducts : filteredProducts.slice(0, 9);

  return (
    <div className="app-page-content space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-5 border border-slate-800/80 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Rapid Counter Sales</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Process customer sales, auto-deduct stock levels, and issue sales receipts.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-rose-950/60 border border-rose-800/80 text-rose-300 p-4 rounded-xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Selector & Quick Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-sky-400" />
              <span>Add Item to Counter Sale</span>
            </h2>

            <form onSubmit={handleAddToCart} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id} disabled={prod.quantity_on_hand === 0}>
                        {prod.name} ({prod.sku}) — GHS {parseFloat(prod.selling_price).toFixed(2)}{' '}
                        {prod.quantity_on_hand === 0 ? '[OUT OF STOCK]' : `(${prod.quantity_on_hand} left)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={products.length === 0}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-sky-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item to Bill</span>
              </button>
            </form>
          </div>

          {/* Quick Product Grid (Capped at 9 Recent Items, Searchable) */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Quick Product Grid {searchFilter.trim() ? `(${displayedProducts.length} results)` : '(Top 9 Recent)'}
              </h3>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter or search SKU..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {displayedProducts.length === 0 ? (
                <div className="col-span-3 py-8 text-center text-slate-500 text-xs">
                  No products found matching "{searchFilter}".
                </div>
              ) : (
                displayedProducts.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      setQuantity(1);
                    }}
                    disabled={prod.quantity_on_hand === 0}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      String(selectedProductId) === String(prod.id)
                        ? 'border-sky-500/80 bg-sky-950/40 shadow-inner'
                        : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/40'
                    } ${prod.quantity_on_hand === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-sky-400 block">{prod.sku}</span>
                      <span className="text-xs font-semibold text-slate-200 line-clamp-1">{prod.name}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400 font-mono">
                        GHS {parseFloat(prod.selling_price).toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] ${
                          prod.quantity_on_hand <= prod.reorder_level
                            ? 'text-amber-400 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {prod.quantity_on_hand} left
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Active Sale Bill Cart Panel */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-full space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-sky-400" />
                <span>Current Sale Bill</span>
              </h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {cart.length} items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs font-medium">
                No items added to current sale bill yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs"
                  >
                    <div className="flex flex-col max-w-[140px]">
                      <span className="font-semibold text-slate-200">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{item.sku}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={item.max_available}
                        value={item.quantity}
                        onChange={(e) => handleUpdateCartQty(item.product_id, e.target.value)}
                        className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-center font-bold text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                      <span className="text-slate-400 font-mono">x GHS {item.unit_price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sky-400 font-mono">
                        GHS {(item.quantity * item.unit_price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(item.product_id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between text-base font-bold text-slate-100">
              <span>Total Bill Amount:</span>
              <span className="text-2xl text-emerald-400 font-mono font-extrabold">
                GHS {cartTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleSubmitSale}
              disabled={cart.length === 0 || submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? 'Processing Transaction...' : 'Complete & Issue Receipt'}</span>
            </button>
          </div>
        </div>
      </div>

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        saleData={completedSale}
      />
    </div>
  );
};

export default Sales;

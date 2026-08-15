import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StockMoveModal = ({ isOpen, onClose, onSave, products = [], suppliers = [], initialProduct = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    product_id: '',
    supplier_id: '',
    movement_type: 'STOCK_IN',
    quantity: 1,
    reason: '',
    allow_negative_override: false
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setFormData((prev) => ({
        ...prev,
        product_id: initialProduct.id,
        movement_type: 'STOCK_IN'
      }));
    } else if (products.length > 0 && !formData.product_id) {
      setFormData((prev) => ({ ...prev, product_id: products[0].id }));
    }
    setError('');
  }, [initialProduct, products, isOpen]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => String(p.id) === String(formData.product_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id) {
      setError('Please select a product.');
      return;
    }

    const qtyNum = parseInt(formData.quantity, 10);
    if (isNaN(qtyNum)) {
      setError('Please enter a valid numeric quantity.');
      return;
    }

    if (formData.movement_type !== 'ADJUSTMENT' && qtyNum <= 0) {
      setError('Quantity must be a positive integer greater than 0.');
      return;
    }

    if (formData.movement_type === 'ADJUSTMENT' && qtyNum < 0) {
      setError('Target stock quantity cannot be negative.');
      return;
    }

    if (formData.movement_type === 'ADJUSTMENT' && (!formData.reason || !formData.reason.trim())) {
      setError('A reason note is mandatory for manual stock adjustments.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave({
        ...formData,
        quantity: qtyNum,
        reason: formData.reason ? formData.reason.trim() : ''
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to process stock movement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-slate-100">Record Stock Movement</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 px-4 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select Product *
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="">-- Choose Product --</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.sku}) — {prod.quantity_on_hand} on hand
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Movement Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'STOCK_IN', label: 'Stock In (+)' },
                { type: 'STOCK_OUT', label: 'Stock Out (-)' },
                { type: 'ADJUSTMENT', label: 'Adjustment' },
              ].map((m) => (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, movement_type: m.type })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    formData.movement_type === m.type
                      ? m.type === 'STOCK_IN'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : m.type === 'STOCK_OUT'
                        ? 'bg-rose-950 text-rose-300 border-rose-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {formData.movement_type === 'STOCK_IN' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Supplier (Optional)
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Direct Delivery / Unknown Supplier --</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {formData.movement_type === 'ADJUSTMENT' ? 'Target Stock Quantity *' : 'Quantity *'}
            </label>
            <input
              type="number"
              min={formData.movement_type === 'ADJUSTMENT' ? "0" : "1"}
              step="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
            />
            {selectedProduct && (
              <p className="mt-1 text-xs text-slate-500">
                Current on-hand stock: <span className="font-semibold text-slate-300">{selectedProduct.quantity_on_hand}</span> units
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Reason / Notes {formData.movement_type === 'ADJUSTMENT' ? '*' : '(Optional)'}
            </label>
            <textarea
              rows="2"
              placeholder={
                formData.movement_type === 'ADJUSTMENT'
                  ? 'Mandatory e.g., Physical stock count discrepancy'
                  : 'e.g., Damaged during transit or stock replenishment'
              }
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            ></textarea>
          </div>

          {user?.role === 'ADMIN' && formData.movement_type === 'STOCK_OUT' && (
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="override_neg"
                checked={formData.allow_negative_override}
                onChange={(e) => setFormData({ ...formData, allow_negative_override: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="override_neg" className="text-xs text-amber-400 font-medium">
                Admin Negative Stock Override (FR-3.6)
              </label>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Confirm Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMoveModal;

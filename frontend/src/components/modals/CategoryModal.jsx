import React, { useState } from 'react';
import { X, Tag, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CategoryModal = ({ isOpen, onClose, onSave, onDelete, categories = [] }) => {
  const { isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave(name.trim());
      setName('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (catId) => {
    if (!window.confirm('Are you sure you want to remove this category?')) return;
    try {
      setError('');
      await onDelete(catId);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-slate-100">Manage Product Categories</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 px-4 py-2.5 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Add Category Form */}
          {isAdmin && (
            <form onSubmit={handleSubmit} className="space-y-3 pb-4 border-b border-slate-800/80">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Add New Category
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Electricals, Bakery..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shadow-md shadow-sky-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Adding...' : 'Add'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Existing Categories List */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Existing Categories ({categories.length})
            </label>
            {categories.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No categories defined yet.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl text-xs"
                  >
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;

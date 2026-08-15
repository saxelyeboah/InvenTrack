import React, { useState, useEffect } from 'react';
import { X, UserCheck, Shield, User } from 'lucide-react';

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'STAFF'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role || 'STAFF'
      });
      setError('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('User full name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave(user.id, {
        name: formData.name.trim(),
        role: formData.role
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update user account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-slate-100">Edit Staff Account & Role</h3>
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
              Email Address / Username
            </label>
            <input
              type="text"
              disabled
              value={user.email}
              className="w-full bg-slate-950/50 border border-slate-800/80 rounded-lg px-3 py-2 text-sm text-slate-400 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kofi Mensah"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Access Role *
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="STAFF">STAFF (Inventory Clerk / Counter Staff)</option>
                <option value="ADMIN">ADMIN (Full System Administrator)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center space-x-1">
              {formData.role === 'ADMIN' ? (
                <span className="text-purple-400 flex items-center">
                  <Shield className="w-3 h-3 mr-1 inline" /> Elevates account to Full Admin (User, Supplier, Financial management).
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center">
                  <User className="w-3 h-3 mr-1 inline" /> Standard Staff access (POS Sales, Receipts, Stock Movements).
                </span>
              )}
            </p>
          </div>

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
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;

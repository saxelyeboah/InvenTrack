import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { UserPlus, Shield, User, Power, RefreshCw, Edit3 } from 'lucide-react';
import UserModal from '../components/modals/UserModal';
import EditUserModal from '../components/modals/EditUserModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (formData) => {
    await api.post('/users', formData);
    fetchUsers();
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleSaveEditUser = async (id, updatedData) => {
    await api.put(`/users/${id}`, updatedData);
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user.id}/status`, {
        is_active: !user.is_active
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status');
    }
  };

  return (
    <div className="app-page-content flex-1 flex flex-col min-h-0 space-y-5 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-5 border border-slate-800/80 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">User Account Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin panel to create staff user accounts, elevate/lower access roles, and manage permissions.
          </p>
        </div>

        <button
          onClick={() => setUserModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-sky-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Staff User</span>
        </button>
      </div>

      {error && (
        <div className="flex-shrink-0 bg-rose-950/60 border border-rose-800/80 text-rose-300 p-4 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* User Directory Data Table */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            System Users Directory
          </h2>
          <button onClick={fetchUsers} className="p-1.5 text-slate-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 relative">
            <thead className="bg-slate-950 sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 shadow-sm">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Full Name</th>
                <th className="px-6 py-3.5">Email Address / Username</th>
                <th className="px-6 py-3.5 text-center">Access Role</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5">Registered At</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    Loading user accounts...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">#{u.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-100">{u.name}</td>
                    <td className="px-6 py-4 font-mono text-sky-400">{u.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {u.role === 'ADMIN' ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                          u.is_active
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-950/40 rounded-lg transition-colors"
                          title="Edit Account & Role"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.is_active
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
                              : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/30'
                          }`}
                          title={u.is_active ? 'Deactivate User Account' : 'Activate User Account'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSave={handleCreateUser}
      />

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={editingUser}
        onSave={handleSaveEditUser}
      />
    </div>
  );
};

export default Users;

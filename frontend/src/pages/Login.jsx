import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PackageSearch, Lock, Mail, AlertCircle, ArrowRight, ShieldAlert, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [deactivatedMsg, setDeactivatedMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('deactivated') === '1') {
      setDeactivatedMsg('Your user account was deactivated by an administrator and you have been signed out.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDeactivatedMsg('');

    if (!email.trim()) {
      setError('Please enter your email address to sign in.');
      return;
    }

    if (!password) {
      setError('Please enter your password to sign in.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-600/10 border border-sky-500/20 text-sky-400 rounded-2xl mb-2 shadow-inner">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            InvenTrack System
          </h1>
          <p className="text-xs text-slate-400">
            Enter your credentials to access the inventory portal
          </p>
        </div>

        {deactivatedMsg && (
          <div className="flex items-center space-x-2 bg-amber-950/80 border border-amber-800 text-amber-300 p-3.5 rounded-xl text-xs font-medium animate-bounce-short">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span>{deactivatedMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 bg-rose-950/60 border border-rose-800 text-rose-300 p-3.5 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Email / Username
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="user@inventrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">InvenTrack Retail System &bull; Enterprise Portal</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

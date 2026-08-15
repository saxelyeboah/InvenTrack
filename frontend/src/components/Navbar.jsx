import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, ChevronRight } from 'lucide-react';

const routeBreadcrumbs = {
  '/': ['InvenTrack', 'Overview', 'Dashboard'],
  '/products': ['InvenTrack', 'Inventory', 'Products Catalog'],
  '/stock': ['InvenTrack', 'Inventory', 'Stock Movements'],
  '/sales': ['InvenTrack', 'Point of Sale', 'Counter Sales'],
  '/reports': ['InvenTrack', 'Analytics', 'Reports Center'],
  '/suppliers': ['InvenTrack', 'Directory', 'Suppliers'],
  '/users': ['InvenTrack', 'System', 'User Accounts'],
};

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const crumbs = routeBreadcrumbs[location.pathname] || ['InvenTrack', 'Application'];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 py-3 sm:px-6 flex items-center justify-between shadow-md">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center space-x-1 text-xs text-slate-400">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
                <span
                  className={`font-medium ${
                    isLast ? 'text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: User Profile & Logout */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            {/* Avatar Circle */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xs ring-2 ring-sky-500/20 shadow-md">
              {getInitials(user.name)}
            </div>

            {/* Name & Role Badge */}
            <div className="flex flex-col text-left hidden sm:flex">
              <span className="text-xs font-semibold text-slate-100 leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-400 leading-tight flex items-center mt-0.5">
                {user.role === 'ADMIN' ? (
                  <span className="text-purple-400 font-medium">Administrator</span>
                ) : (
                  <span className="text-emerald-400 font-medium">Inventory Clerk</span>
                )}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

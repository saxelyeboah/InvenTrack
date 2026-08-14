import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  ShoppingCart,
  FileBarChart2,
  Users,
  Truck,
  PackageSearch,
  ChevronLeft,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navGroups = [
    {
      group: 'MAIN',
      items: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard }],
    },
    {
      group: 'INVENTORY MANAGEMENT',
      items: [
        { label: 'Products Catalog', path: '/products', icon: Boxes },
        { label: 'Stock Movements', path: '/stock', icon: ArrowRightLeft },
        { label: 'Counter Sales', path: '/sales', icon: ShoppingCart },
      ],
    },
    {
      group: 'ANALYTICS & DIRECTORY',
      items: [
        { label: 'Reports & Export', path: '/reports', icon: FileBarChart2 },
        { label: 'Suppliers Directory', path: '/suppliers', icon: Truck },
      ],
    },
  ];

  if (isAdmin) {
    navGroups.push({
      group: 'ADMINISTRATION',
      items: [{ label: 'User Accounts', path: '/users', icon: Users }],
    });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/80 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-200 ease-in-out flex flex-col justify-between select-none`}
      >
        <div>
          {/* Sidebar Header / Logo */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <PackageSearch className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  InvenTrack
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Retail ERP
                </span>
              </div>
            </div>

            <button
              onClick={closeSidebar}
              className="md:hidden text-slate-400 hover:text-slate-100 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items Grouped */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {group.group}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `group relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-sky-950/50 text-sky-400 font-semibold shadow-inner'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Left Indicator Bar */}
                          {isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-sky-400 rounded-r-full shadow-sm shadow-sky-400"></span>
                          )}
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-300'
                            }`}
                          />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span>InvenTrack v1.0</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
            System Online
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

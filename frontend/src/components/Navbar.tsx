import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications } from '../services/api';
import {
  Layers, LogOut, LogIn, UserPlus, Building2, Ticket, History, Bell, PlusCircle, LayoutDashboard, Users, BarChart3
} from 'lucide-react';
import { APP_TITLE } from '../utils/constants';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !user) return;
    try {
      const data = await getNotifications();
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // Ignore if unauthenticated
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center space-x-3 group shrink-0">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <span className="font-bold text-base sm:text-lg text-white tracking-tight leading-none">{APP_TITLE}</span>
            <span className="mt-0.5 sm:mt-0 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium self-start sm:self-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && user && (
          <nav className="hidden md:flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {/* Customer Links */}
            {user.role === 'customer' && (
              <>
                <Link
                  to="/customer/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive('/customer/dashboard') || isActive('/customer')
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/customer/locations"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive('/customer/locations')
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Locations</span>
                </Link>

                <Link
                  to="/customer/join"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive('/customer/join')
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Join Queue</span>
                </Link>

                <Link
                  to="/customer/history"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive('/customer/history')
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                </Link>

                <Link
                  to="/customer/notifications"
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive('/customer/notifications')
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="relative">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>Notifications</span>
                </Link>
              </>
            )}

            {/* Admin Links */}
            {user.role === 'admin' && (
              <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80">
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    isActive('/admin/dashboard') || isActive('/admin')
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>

                <Link
                  to="/admin/locations"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    isActive('/admin/locations')
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Locations</span>
                </Link>

                <Link
                  to="/admin/services"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    isActive('/admin/services')
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Services</span>
                </Link>

                <Link
                  to="/admin/staff"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    isActive('/admin/staff')
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Staff</span>
                </Link>

                <Link
                  to="/admin/analytics"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    isActive('/admin/analytics')
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Analytics</span>
                </Link>
              </div>
            )}
          </nav>
        )}

        {/* User Status / Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                <div className="w-6 h-6 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[120px] truncate">{user.name}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/30">
                  {user.role}
                </span>
                {user.organization_name && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-300 border-blue-500/20 hidden md:inline max-w-[130px] truncate" title={user.organization_name}>
                    🏢 {user.organization_name}
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-red-400 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );

};

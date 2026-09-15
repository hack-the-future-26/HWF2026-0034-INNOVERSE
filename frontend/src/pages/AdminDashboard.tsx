import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAdminOverview } from '../services/api';
import { AdminOverview } from '../types/admin';
import {
  ShieldCheck, Building2, Layers, Users, Activity, BarChart3, Database, Cpu, ArrowRight, CheckCircle2, TrendingUp, Monitor
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const data = await getAdminOverview();
        setOverview(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 glass-panel-glow rounded-3xl p-6 sm:p-8">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Executive Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            System Administration & Control
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage locations, services, staff users, counters, and live analytics telemetry.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl text-xs text-slate-300 self-start sm:self-auto">
          Logged in as: <strong className="text-emerald-400">{user?.email}</strong>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin/locations')}
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition cursor-pointer space-y-1 group"
        >
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Total Locations</span>
            <Building2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
            {loading ? '...' : overview?.total_locations}
          </div>
          <p className="text-[11px] text-blue-400 font-semibold flex items-center space-x-1">
            <span>Manage Locations</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/services')}
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition cursor-pointer space-y-1 group"
        >
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Configured Services</span>
            <Layers className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
            {loading ? '...' : overview?.total_services}
          </div>
          <p className="text-[11px] text-purple-400 font-semibold flex items-center space-x-1">
            <span>Manage Services</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/staff')}
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition cursor-pointer space-y-1 group"
        >
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Staff Operators</span>
            <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
            {loading ? '...' : overview?.total_staff}
          </div>
          <p className="text-[11px] text-amber-400 font-semibold flex items-center space-x-1">
            <span>Manage Staff & Counters</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/analytics')}
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer space-y-1 group"
        >
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
            <span>Customers Served</span>
            <BarChart3 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {loading ? '...' : overview?.total_customers_served}
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <span>Open Real-Time Analytics</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/analytics"
          className="glass-panel-glow p-6 rounded-3xl border border-blue-500/30 hover:border-blue-500 transition space-y-3 block group"
        >
          <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 w-fit group-hover:scale-110 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Recharts Analytics Suite</h3>
            <p className="text-xs text-slate-400 mt-1">Hourly queue volume, peak demand factors, wait time SLAs & cancellation metrics.</p>
          </div>
          <div className="text-xs font-bold text-blue-400 flex items-center space-x-1 pt-2">
            <span>Explore Visualizers</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/locations"
          className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition space-y-3 block group"
        >
          <div className="p-3 bg-slate-800 rounded-2xl text-blue-400 w-fit group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Locations & Branches</h3>
            <p className="text-xs text-slate-400 mt-1">Add, update, and manage active hospital, bank, retail, and government venues.</p>
          </div>
          <div className="text-xs font-bold text-slate-300 flex items-center space-x-1 pt-2">
            <span>Configure Venues</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/services"
          className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition space-y-3 block group"
        >
          <div className="p-3 bg-slate-800 rounded-2xl text-purple-400 w-fit group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Services & SLAs</h3>
            <p className="text-xs text-slate-400 mt-1">Manage service offerings, average service times, and queue activation parameters.</p>
          </div>
          <div className="text-xs font-bold text-slate-300 flex items-center space-x-1 pt-2">
            <span>Configure Services</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/admin/staff"
          className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition space-y-3 block group"
        >
          <div className="p-3 bg-slate-800 rounded-2xl text-amber-400 w-fit group-hover:scale-110 transition-transform">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Staff & Counters</h3>
            <p className="text-xs text-slate-400 mt-1">Provision staff operator accounts and assign physical counters at venues.</p>
          </div>
          <div className="text-xs font-bold text-slate-300 flex items-center space-x-1 pt-2">
            <span>Configure Staff</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};

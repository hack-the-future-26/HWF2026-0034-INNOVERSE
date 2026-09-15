import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getStaffQueues, getStaffDashboardSummary, callNextCustomer } from '../../services/api';
import { StaffQueue, StaffDashboardSummary } from '../../types/staff';
import {
  Users, PhoneCall, CheckCircle, Clock, Activity, Building2, Layers, RefreshCw, ArrowRight, ShieldCheck
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [queues, setQueues] = useState<StaffQueue[]>([]);
  const [summary, setSummary] = useState<StaffDashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [queuesData, summaryData] = await Promise.all([
        getStaffQueues(),
        getStaffDashboardSummary()
      ]);
      setQueues(queuesData);
      setSummary(summaryData);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleCallNext = async (queueId: number) => {
    setActionLoading(queueId);
    try {
      await callNextCustomer(queueId);
      await fetchStaffData();
      navigate(`/staff/queue/${queueId}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to call next customer');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Staff Counter Portal</span>
            </div>
            {user?.organization_name && (
              <div className="inline-flex items-center space-x-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{user.organization_name}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Worker Dashboard - {user?.organization_name || 'All Queues'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time queue operations scoped to <span className="text-slate-200 font-medium">{user?.organization_name || 'your assigned organization'}</span>.
          </p>
        </div>

        <button
          onClick={fetchStaffData}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh Queues</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">Active Queues</span>
          <span className="text-2xl font-black text-slate-100 font-mono">
            {summary?.active_queues_count || 0}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">Waiting Customers</span>
          <span className="text-2xl font-black text-purple-400 font-mono">
            {summary?.waiting_customers_count || 0}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">Currently Serving</span>
          <span className="text-2xl font-black text-blue-400 font-mono">
            {summary?.currently_serving_count || 0}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">Completed Today</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {summary?.completed_today_count || 0}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">Average Wait</span>
          <span className="text-2xl font-black text-amber-300 font-mono">
            {summary?.average_wait_time || 0} m
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">Active Counters</span>
          <span className="text-2xl font-black text-slate-200 font-mono">
            {summary?.active_counters_count || 0}
          </span>
        </div>
      </div>

      {/* Active Queues Panel Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Active Location Queues ({queues.length})</span>
          </h2>
          <Link to="/staff/queues" className="text-xs text-purple-400 hover:underline">
            View All Queues
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading counter queues...</p>
          </div>
        ) : queues.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
            No active queues found at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {queues.map((q) => (
              <div
                key={q.id}
                className="glass-panel-glow rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                        {q.location_name}
                      </span>
                      <h3 className="text-xl font-bold text-slate-100 mt-1">{q.service_name}</h3>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                      {q.waiting_count} Waiting
                    </span>
                  </div>

                  {/* Serving Token Status */}
                  <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">NOW SERVING</span>
                      <span className="text-2xl font-black text-purple-400 font-mono tracking-wider">
                        {q.now_serving_token || 'None'}
                      </span>
                      {q.now_serving_user && (
                        <p className="text-xs text-slate-400 mt-0.5">{q.now_serving_user}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">ASSIGNED COUNTER</span>
                      <span className="text-xs font-semibold text-slate-200">
                        {q.now_serving_counter || 'Counter 1'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleCallNext(q.id)}
                    disabled={actionLoading === q.id || q.waiting_count === 0}
                    className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-40"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>CALL NEXT</span>
                  </button>

                  <Link
                    to={`/staff/queue/${q.id}`}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center space-x-1 transition"
                  >
                    <span>Control Panel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

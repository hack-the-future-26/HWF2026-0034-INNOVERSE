import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveQueue, getLocations, cancelQueueEntry } from '../../services/api';
import { QueueEntry, Location } from '../../types/customer';
import {
  Ticket, Clock, MapPin, Sparkles, ArrowRight, XCircle, Eye,
  Building2, Users, AlertCircle, RefreshCw, ChevronRight, CheckCircle2
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeQueue, setActiveQueue] = useState<QueueEntry | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [queueData, locationsData] = await Promise.all([
        getActiveQueue(),
        getLocations()
      ]);
      setActiveQueue(queueData);
      setLocations(locationsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancel = async () => {
    if (!activeQueue) return;
    if (!window.confirm('Are you sure you want to cancel your queue ticket?')) return;

    setCancelling(true);
    try {
      await cancelQueueEntry(activeQueue.id);
      setActiveQueue(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel queue ticket');
    } finally {
      setCancelling(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8">
      {/* Header Greeting Banner */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Ticket className="w-56 h-56 text-blue-400" />
        </div>
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Queue Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {getGreeting()}, {user?.name || 'Customer'}!
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Track live queue positions, estimated wait times, and explore nearby service locations.
          </p>
        </div>
      </div>

      {/* Active Queue Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-blue-400" />
            <span>Your Active Queue</span>
          </h2>
          <button
            onClick={fetchDashboardData}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 border border-slate-800 bg-slate-900 px-3 py-1.5 rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading your live queue ticket...</p>
          </div>
        ) : activeQueue ? (
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 border border-blue-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs text-blue-400 font-semibold tracking-wide uppercase">
                  {activeQueue.location_name}
                </span>
                <h3 className="text-lg font-bold text-white">{activeQueue.service_name}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold animate-pulse">
                  {activeQueue.status}
                </span>
              </div>
            </div>

            {/* Token Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Your Token</span>
                <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono tracking-wider">
                  {activeQueue.token_number}
                </span>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Position</span>
                <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                  #{activeQueue.position}
                </span>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">People Ahead</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {activeQueue.people_ahead}
                </span>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-amber-500/30">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span className="text-xs text-slate-400">AI Est. Wait</span>
                  <Sparkles className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {activeQueue.estimated_wait} m
                </span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                  {Math.round((activeQueue.confidence ?? 0.87) * 100)}% Confidence
                </span>
              </div>

            </div>

            {/* Card Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => navigate(`/customer/queue/${activeQueue.id}`)}
                className="w-full sm:w-auto flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Live Queue Screen</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full sm:w-auto py-3 px-5 bg-slate-900 hover:bg-red-500/10 text-red-400 border border-slate-800 hover:border-red-500/30 font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Queue</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-8 text-center space-y-4 border border-slate-800">
            <div className="w-12 h-12 bg-slate-800/80 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-base">No Active Queue Ticket</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You are currently not waiting in any queue. Choose a location below or click Join Queue to get a token.
              </p>
            </div>
            <Link
              to="/customer/join"
              className="inline-flex items-center space-x-2 py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20"
            >
              <span>Join a Queue Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Available / Nearby Locations Section */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Available Locations</span>
            </h2>
            <p className="text-xs text-slate-400">Select a venue to view open services and join live queues</p>
          </div>
          <Link to="/customer/locations" className="text-xs text-blue-400 hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.slice(0, 4).map((loc) => (
            <div
              key={loc.id}
              className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100 text-base">{loc.name}</h3>
                  <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[11px] font-semibold capitalize">
                    {loc.type}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{loc.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Services</span>
                  <span className="font-semibold text-slate-200">{loc.services_count}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Queue Size</span>
                  <span className="font-semibold text-purple-300">{loc.total_queue_size}</span>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Avg Wait</span>
                  <span className="font-semibold text-amber-300">{loc.estimated_wait_minutes} m</span>
                </div>
              </div>

              <Link
                to={`/customer/location/${loc.id}`}
                className="w-full py-2.5 text-center text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700/60 transition flex items-center justify-center space-x-1.5"
              >
                <span>View Location Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

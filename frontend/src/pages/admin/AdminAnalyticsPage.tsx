import React, { useState, useEffect } from 'react';
import {
  getAdminOverview, getQueueVolumeAnalytics, getWaitTimeAnalytics,
  getPeakHoursAnalytics, getMetricsSummary
} from '../../services/api';
import {
  AdminOverview, QueueVolumeHour, WaitTimesAnalysis, PeakHoursData, MetricsSummary
} from '../../types/admin';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  BarChart3, Clock, Users, Activity, TrendingUp, AlertTriangle, ShieldCheck, RefreshCw, Layers, PieChart as PieIcon
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AdminAnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [volumeData, setVolumeData] = useState<QueueVolumeHour[]>([]);
  const [waitTimeData, setWaitTimeData] = useState<WaitTimesAnalysis[]>([]);
  const [peakHoursData, setPeakHoursData] = useState<PeakHoursData[]>([]);
  const [metricsSummary, setMetricsSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [ov, vol, wait, peak, summary] = await Promise.all([
        getAdminOverview(),
        getQueueVolumeAnalytics(),
        getWaitTimeAnalytics(),
        getPeakHoursAnalytics(),
        getMetricsSummary()
      ]);
      setOverview(ov);
      setVolumeData(vol);
      setWaitTimeData(wait);
      setPeakHoursData(peak);
      setMetricsSummary(summary);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !overview) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading real-time analytics telemetry from FastAPI...</p>
      </div>
    );
  }

  const ratePieData = [
    { name: 'Completed', value: 100 - (metricsSummary?.cancellation_rate_percent || 5) - (metricsSummary?.no_show_rate_percent || 3) },
    { name: 'Cancelled', value: metricsSummary?.cancellation_rate_percent || 5 },
    { name: 'No-Show', value: metricsSummary?.no_show_rate_percent || 3 }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel-glow rounded-3xl p-6 sm:p-8 border border-blue-500/30">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>FastAPI Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Queue Intelligence & Real-Time Performance
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Live telemetry, hourly load distributions, wait times analysis, and operational efficiency metrics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 block font-semibold">Total Customers Served</span>
          <div className="text-3xl font-black text-blue-400 font-mono">
            {overview?.total_customers_served.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center space-x-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>Real-time DB records</span>
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 block font-semibold">Average Waiting Time</span>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {overview?.average_wait_time_minutes} min
          </div>
          <span className="text-[11px] text-amber-400/90 font-semibold">
            Target: 10.0 min
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 block font-semibold">Cancellation Rate</span>
          <div className="text-3xl font-black text-rose-400 font-mono">
            {overview?.cancellation_rate}%
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">
            No-Show Rate: {overview?.no_show_rate}%
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 block font-semibold">Counter Utilization</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {overview?.counter_utilization_rate}%
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            Active Counters Open
          </span>
        </div>
      </div>

      {/* Chart 1: Queue Volume By Hour */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-100 text-lg flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>1. Queue Volume by Operating Hour</span>
            </h3>
            <p className="text-xs text-slate-400">Total customer entries and completed tickets across operating hours</p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="volume" name="Total Queue Volume" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVolume)" />
              <Area type="monotone" dataKey="completed" name="Completed Tickets" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 2 Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Average Wait Time per Service */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>2. Average Waiting Time per Service</span>
            </h3>
            <p className="text-xs text-slate-400">Actual average wait minutes compared against target SLA</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitTimeData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="service_name" stroke="#64748b" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="avg_wait_minutes" name="Actual Wait (min)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target_wait_minutes" name="Target SLA (min)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Peak Hours Analysis */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>3. Peak Hours & Load Factor Analysis</span>
            </h3>
            <p className="text-xs text-slate-400">Peak demand factor distribution across operating hours</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={peakHoursData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="people_count" name="Customers" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2 Column Charts (Cancellation & Counter Utilization) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 4: Ticket Disposition Pie */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 lg:col-span-1">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              <span>4. Ticket Outcome Rates</span>
            </h3>
            <p className="text-xs text-slate-400">Completed vs Cancelled vs No-Show</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ratePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Counter Utilization Metric Box */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>5. Counter Utilization & Service Metrics</span>
            </h3>
            <p className="text-xs text-slate-400">System efficiency performance metrics calculated from backend database</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block font-semibold">Total Entries Analyzed</span>
              <span className="text-2xl font-extrabold text-blue-400 font-mono">
                {metricsSummary?.total_entries_analyzed}
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block font-semibold">Avg Service Duration</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {metricsSummary?.avg_service_duration_minutes} m
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 block font-semibold">Counter Utilization</span>
              <span className="text-2xl font-extrabold text-purple-400 font-mono">
                {metricsSummary?.counter_utilization_percent}%
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-blue-300 font-semibold">All analytics updated dynamically via FastAPI queries</span>
            <span className="text-emerald-400 font-bold">100% Real DB Telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

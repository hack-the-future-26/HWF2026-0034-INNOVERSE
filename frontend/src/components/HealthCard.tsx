import React from 'react';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { Activity, Database, ShieldCheck, RefreshCw, Server, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const HealthCard: React.FC = () => {
  const { data, loading, error, latency, refetch } = useHealthCheck();

  return (
    <div className="glass-panel-glow rounded-2xl p-6 max-w-xl w-full mx-auto shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Backend System Status</h3>
            <p className="text-xs text-slate-400">FastAPI & Frontend Verification</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>Ping</span>
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 animate-pulse">Testing connection to backend API...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 space-y-2">
          <div className="flex items-center space-x-2 text-red-400 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>Connection Offline / Failed</span>
          </div>
          <p className="text-xs text-red-300/80">{error}</p>
          <p className="text-xs text-slate-400 pt-1">
            Ensure the FastAPI backend server is running on <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">http://localhost:8000</code>.
          </p>
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-sm font-semibold text-emerald-400 capitalize">{data.status}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>CORS Config</span>
              </div>
              <div className="flex items-center space-x-1 text-sm font-semibold text-blue-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>Database Engine</span>
              </div>
              <div className="text-sm font-semibold text-purple-300 capitalize">{data.database_status}</div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Roundtrip Latency</span>
              </div>
              <div className="text-sm font-semibold text-amber-300">{latency} ms</div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 flex justify-between items-center">
            <span>App: <strong className="text-slate-200">{data.app_name}</strong> ({data.version})</span>
            <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-sans">{data.environment}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

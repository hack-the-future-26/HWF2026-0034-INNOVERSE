import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Ticket, Clock, CheckCircle2, MapPin, Bell, Sparkles } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Ticket className="w-48 h-48 text-blue-400" />
        </div>
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400 text-sm">
            Track your active queue tickets, estimated wait times, and location notifications in real-time.
          </p>
        </div>
      </div>

      {/* Active Ticket Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Your Current Active Ticket</h3>
                <p className="text-xs text-slate-400">City Hospital &bull; OPD Room 102</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold animate-pulse">
              WAITING
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Token Number</span>
              <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">OP004</span>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Queue Position</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">#2</span>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Est. Wait</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">14 m</span>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>AI Wait Time Model confidence: <strong>94%</strong></span>
            </div>
            <span className="text-slate-400">Updated 1m ago</span>
          </div>
        </div>

        {/* User Account Quick Info */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                {user?.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">{user?.name}</h4>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl text-xs space-y-2 border border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Account Role:</span>
                <span className="text-emerald-400 font-semibold capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Member Since:</span>
                <span className="text-slate-200">{new Date(user?.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-400 flex items-center space-x-2 border border-slate-700/50">
            <Bell className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Notifications enabled for token status updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

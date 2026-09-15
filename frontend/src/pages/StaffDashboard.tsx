import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, PhoneCall, CheckCircle, SkipForward, Users, Play, Clock, ShieldAlert } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentToken, setCurrentToken] = useState('OP002');
  const [status, setStatus] = useState('SERVING');

  const handleCallNext = () => {
    setCurrentToken('OP003');
    setStatus('CALLED');
  };

  const handleComplete = () => {
    setStatus('COMPLETED');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Staff Counter Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Counter Management &bull; {user?.name}
          </h1>
          <p className="text-slate-400 text-sm">Location: City Hospital &bull; Assigned to OPD Room 102</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
            Counter OPEN
          </span>
        </div>
      </div>

      {/* Counter Controls & Current Serving Token */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-sm font-semibold text-slate-300">Currently Managing Token</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold">
              {status}
            </span>
          </div>

          <div className="text-center py-6">
            <span className="text-xs text-slate-400 block mb-2">Token In Progress</span>
            <span className="text-5xl sm:text-6xl font-black text-purple-400 font-mono tracking-wider">
              {currentToken}
            </span>
            <p className="text-xs text-slate-400 mt-2">Patient / Customer: Jane Smith</p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={handleCallNext}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Next</span>
            </button>
            <button
              onClick={handleComplete}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </button>
            <button
              onClick={() => setStatus('SKIPPED')}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip / No Show</span>
            </button>
          </div>
        </div>

        {/* Next in Queue List */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-3 text-sm flex justify-between items-center">
            <span>Upcoming Tokens</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">4 Waiting</span>
          </h3>

          <div className="space-y-2.5">
            {[
              { token: 'OP003', name: 'John Doe', wait: '2m' },
              { token: 'OP004', name: 'Alex Jones', wait: '14m' },
              { token: 'OP005', name: 'Maria Garcia', wait: '26m' },
              { token: 'OP006', name: 'Anonymous', wait: '38m' },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono font-bold text-purple-300">{item.token}</span>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="text-slate-500 font-mono">{item.wait}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStaffQueues } from '../../services/api';
import { StaffQueue } from '../../types/staff';
import { Layers, Users, PhoneCall, ArrowRight, RefreshCw, Building2 } from 'lucide-react';

export const StaffQueuesPage: React.FC = () => {
  const [queues, setQueues] = useState<StaffQueue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const data = await getStaffQueues();
      setQueues(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
            <Layers className="w-8 h-8 text-purple-400" />
            <span>Staff Counter Queues</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Select an active queue to launch the interactive counter control panel.
          </p>
        </div>

        <button
          onClick={fetchQueues}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading queues...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queues.map((q) => (
            <div
              key={q.id}
              className="glass-panel-glow rounded-3xl p-6 border border-slate-800 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                      {q.location_name}
                    </span>
                    <h2 className="text-lg font-bold text-slate-100 mt-1">{q.service_name}</h2>
                  </div>
                  <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-semibold">
                    {q.waiting_count} Waiting
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Now Serving Token:</span>
                    <strong className="text-purple-300 font-mono">{q.now_serving_token || 'None'}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Counter:</span>
                    <span className="text-slate-200">{q.now_serving_counter || 'Counter 1'}</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/staff/queue/${q.id}`}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition"
              >
                <span>Launch Counter Control Panel</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

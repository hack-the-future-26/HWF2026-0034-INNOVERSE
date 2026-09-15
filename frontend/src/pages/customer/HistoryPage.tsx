import React, { useState, useEffect } from 'react';
import { getQueueHistory } from '../../services/api';
import { QueueEntry } from '../../types/customer';
import { History, Calendar, CheckCircle2, XCircle, Clock, ArrowRight, Building2, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getQueueHistory();
        setHistory(data);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'SKIPPED':
      case 'NO_SHOW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
          <History className="w-8 h-8 text-blue-400" />
          <span>Queue Visit History</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Review your past queue tokens, visit dates, and completion metrics.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading visit history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-md mx-auto">
          <History className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200">No Queue History Found</h3>
          <p className="text-xs text-slate-400">You haven't joined any service queues yet.</p>
          <Link
            to="/customer/join"
            className="inline-flex items-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20"
          >
            <span>Join a Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Token</th>
                  <th className="p-3.5 font-semibold">Location</th>
                  <th className="p-3.5 font-semibold">Service</th>
                  <th className="p-3.5 font-semibold">Joined Date</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-400">{entry.token_number}</td>
                    <td className="p-3.5 font-medium text-slate-100">{entry.location_name}</td>
                    <td className="p-3.5 text-slate-400">{entry.service_name}</td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(entry.joined_at).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          entry.status
                        )}`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/customer/queue/${entry.id}`}
                        className="text-xs text-blue-400 font-semibold hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

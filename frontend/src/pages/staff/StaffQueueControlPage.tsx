import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getStaffQueues, callNextCustomer, startService, completeService,
  skipCustomer, noShowCustomer
} from '../../services/api';
import { StaffQueue } from '../../types/staff';
import {
  PhoneCall, Play, CheckCircle, SkipForward, UserX, ArrowLeft, RefreshCw,
  Users, Activity, AlertCircle, ShieldCheck
} from 'lucide-react';

import { useToast } from '../../contexts/ToastContext';

export const StaffQueueControlPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [queue, setQueue] = useState<StaffQueue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchQueueDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const queues = await getStaffQueues();
      const current = queues.find((q) => q.id === Number(id)) || null;
      setQueue(current);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueDetail();
  }, [id]);

  const executeAction = async (actionFn: () => Promise<{ message: string }>) => {
    setActionLoading(true);
    setActionMsg(null);
    try {
      const res = await actionFn();
      setActionMsg(res.message);
      showToast(res.message, 'success');
      await fetchQueueDetail();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail 
        || (err instanceof Error ? err.message : 'Action failed');
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };


  const handleCallNext = () => {
    if (!queue) return;
    executeAction(() => callNextCustomer(queue.id));
  };

  const handleStartService = () => {
    if (!queue?.now_serving_id) return;
    executeAction(() => startService(queue.now_serving_id!));
  };

  const handleComplete = () => {
    if (!queue?.now_serving_id) return;
    executeAction(() => completeService(queue.now_serving_id!));
  };

  const handleSkip = () => {
    if (!queue?.now_serving_id) return;
    executeAction(() => skipCustomer(queue.now_serving_id!));
  };

  const handleNoShow = () => {
    if (!queue?.now_serving_id) return;
    executeAction(() => noShowCustomer(queue.now_serving_id!));
  };

  if (loading && !queue) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading counter control panel...</p>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="font-bold text-slate-100">Queue Not Found</h3>
        <Link to="/staff/queues" className="text-xs text-purple-400 font-semibold hover:underline">
          Return to Staff Queues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <Link
          to="/staff/queues"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Staff Queues</span>
        </Link>

        <button
          onClick={fetchQueueDetail}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh State</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-300 text-xs flex items-center space-x-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main Counter Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NOW SERVING Box */}
        <div className="md:col-span-2 glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 border border-purple-500/30">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                {queue.location_name}
              </span>
              <h1 className="text-xl font-bold text-white mt-1">{queue.service_name}</h1>
            </div>

            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase">
              {queue.now_serving_status || 'IDLE'}
            </span>
          </div>

          <div className="text-center py-6 space-y-2">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase block">
              NOW SERVING
            </span>
            <div className="text-5xl sm:text-6xl font-black text-purple-400 font-mono tracking-widest">
              {queue.now_serving_token || '---'}
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Customer: <strong className="text-white">{queue.now_serving_user || 'None'}</strong>
            </p>
            <p className="text-xs text-slate-400">
              Assigned Counter: <strong className="text-purple-300">{queue.now_serving_counter || 'Counter 1'}</strong>
            </p>
          </div>

          {/* Action Control Panel Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            <button
              onClick={handleCallNext}
              disabled={actionLoading || queue.waiting_count === 0}
              className="py-3 px-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex flex-col items-center justify-center space-y-1 transition cursor-pointer disabled:opacity-40"
            >
              <PhoneCall className="w-4 h-4" />
              <span>CALL NEXT</span>
            </button>

            <button
              onClick={handleStartService}
              disabled={actionLoading || !queue.now_serving_id || queue.now_serving_status === 'SERVING'}
              className="py-3 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex flex-col items-center justify-center space-y-1 transition cursor-pointer disabled:opacity-40"
            >
              <Play className="w-4 h-4" />
              <span>START</span>
            </button>

            <button
              onClick={handleComplete}
              disabled={actionLoading || !queue.now_serving_id}
              className="py-3 px-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex flex-col items-center justify-center space-y-1 transition cursor-pointer disabled:opacity-40"
            >
              <CheckCircle className="w-4 h-4" />
              <span>COMPLETE</span>
            </button>

            <button
              onClick={handleSkip}
              disabled={actionLoading || !queue.now_serving_id}
              className="py-3 px-2 bg-slate-900 hover:bg-amber-500/10 text-amber-300 border border-slate-800 hover:border-amber-500/30 font-semibold text-xs rounded-xl flex flex-col items-center justify-center space-y-1 transition cursor-pointer disabled:opacity-40"
            >
              <SkipForward className="w-4 h-4" />
              <span>SKIP</span>
            </button>

            <button
              onClick={handleNoShow}
              disabled={actionLoading || !queue.now_serving_id}
              className="py-3 px-2 bg-slate-900 hover:bg-red-500/10 text-red-400 border border-slate-800 hover:border-red-500/30 font-semibold text-xs rounded-xl flex flex-col items-center justify-center space-y-1 transition cursor-pointer disabled:opacity-40 col-span-2 sm:col-span-1"
            >
              <UserX className="w-4 h-4" />
              <span>NO-SHOW</span>
            </button>
          </div>
        </div>

        {/* NEXT CUSTOMERS Box */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>NEXT CUSTOMERS</span>
              </h3>
              <span className="text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-purple-300 font-mono">
                {queue.waiting_count} Waiting
              </span>
            </div>

            {queue.next_customers.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No customers waiting in line.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {queue.next_customers.map((cust) => (
                  <div
                    key={cust.id}
                    className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-purple-300 text-sm block">
                        {cust.token_number}
                      </span>
                      <span className="text-slate-300 font-medium">{cust.user_name}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Position</span>
                      <span className="font-mono font-bold text-emerald-400">#{cust.position}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQueueEntryDetails, cancelQueueEntry } from '../../services/api';
import { QueueEntry } from '../../types/customer';
import { useQueueWebSocket } from '../../hooks/useQueueWebSocket';
import { useToast } from '../../contexts/ToastContext';
import {
  Ticket, Clock, Users, ArrowLeft, RefreshCw, XCircle, CheckCircle2,
  AlertCircle, Sparkles, Activity, ShieldCheck, Radio
} from 'lucide-react';

export const LiveQueuePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, lastEvent } = useQueueWebSocket(queueEntry?.queue_id);

  const fetchLiveDetails = async (showToastNotice = false) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getQueueEntryDetails(Number(id));
      setQueueEntry(data);
      if (showToastNotice) {
        showToast('Queue status synced live', 'info');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Queue entry details not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDetails();
  }, [id]);

  // Real-time synchronization whenever WebSocket event is received
  useEffect(() => {
    if (lastEvent) {
      console.log('[LiveQueuePage] Syncing UI for WebSocket event:', lastEvent.event);
      if (lastEvent.event === 'NOTIFICATION' && lastEvent.data?.message) {
        showToast(String(lastEvent.data.message), 'warning');
      }
      fetchLiveDetails();
    }
  }, [lastEvent]);

  const handleCancel = async () => {
    if (!queueEntry) return;
    if (!window.confirm('Are you sure you want to cancel your queue ticket?')) return;

    setCancelling(true);
    try {
      await cancelQueueEntry(queueEntry.id);
      showToast('Queue ticket cancelled successfully', 'info');
      fetchLiveDetails();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel queue ticket', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !queueEntry) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Connecting to live queue telemetry...</p>
      </div>
    );
  }

  if (error || !queueEntry) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center space-y-4 max-w-md mx-auto border border-slate-800">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="font-bold text-slate-100">{error || 'Queue Ticket Not Found'}</h3>
        <Link to="/customer/dashboard" className="text-xs text-blue-400 font-semibold hover:underline">
          Return to Customer Dashboard
        </Link>
      </div>
    );
  }

  // Calculate progress bar percentage (0 to 100%)
  const progressPercent = Math.min(
    100,
    Math.max(10, Math.round(((10 - Math.min(queueEntry.people_ahead, 10)) / 10) * 100))
  );

  const timelineSteps = [
    { stage: 1, title: 'Joined Queue', desc: 'Entry recorded' },
    { stage: 2, title: 'Token Generated', desc: `Token ${queueEntry.token_number}` },
    { stage: 3, title: 'Queue Tracking', desc: 'Live position monitoring' },
    { stage: 4, title: 'Approaching Turn', desc: 'Please be near the counter' },
    { stage: 5, title: 'Your Turn', desc: 'Proceed to counter' },
    { stage: 6, title: 'Completed', desc: 'Service finished' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <div className="flex items-center space-x-3">
          {/* Glowing Live Indicator */}
          {isConnected ? (
            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE (WebSocket)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs">
              <span className="w-2 h-2 bg-slate-500 rounded-full" />
              <span>Connecting WS...</span>
            </div>
          )}

          <button
            onClick={() => fetchLiveDetails(true)}
            className="flex items-center space-x-1.5 px-3 py-1 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Giant Hero Token Box - VISUAL HIGHLIGHT */}
      <div className="token-hero-box rounded-3xl p-6 sm:p-10 text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full">
            {queueEntry.location_name}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white pt-2">{queueEntry.service_name}</h1>
          <p className="text-xs text-slate-400 flex items-center justify-center space-x-2 pt-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            <span>Status: <strong className="text-emerald-300 font-bold">{queueEntry.status}</strong></span>
          </p>
        </div>

        {/* Oversized Token Number Card */}
        <div className="py-5 px-4 space-y-1 bg-slate-950/80 rounded-3xl border border-blue-500/30 max-w-sm mx-auto shadow-2xl">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest block">YOUR TOKEN</span>
          <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 font-mono tracking-wider">
            {queueEntry.token_number}
          </span>
        </div>

        {/* High Contrast Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">Now Serving</span>
            <span className="text-2xl font-black text-purple-300 font-mono">
              {queueEntry.now_serving_token || 'A-001'}
            </span>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">People Ahead</span>
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {queueEntry.people_ahead}
            </span>
          </div>

          {/* Visually Distinguishable AI Estimated Wait Card */}
          <div className="glass-panel-ai p-4 rounded-2xl space-y-1 text-center border-purple-500/40 relative overflow-hidden">
            <div className="flex items-center justify-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs font-extrabold text-purple-200">AI Estimated Wait</span>
            </div>
            <div className="text-3xl font-black text-amber-300 font-mono">
              {queueEntry.estimated_wait} min
            </div>
            <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{Math.round((queueEntry.confidence ?? 0.87) * 100)}% Confidence</span>
            </div>
          </div>
        </div>

        {/* Queue Progress Bar */}
        <div className="space-y-2 pt-2 max-w-2xl mx-auto">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Real-time Progress</span>
            <span className="font-mono text-blue-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800 animate-shimmer">
            <div
              className="bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-md shadow-blue-500/30"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800">
        <h3 className="font-bold text-slate-100 text-lg flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span>Queue Tracking Timeline</span>
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {timelineSteps.map((step) => {
            const isDone = queueEntry.timeline_stage > step.stage;
            const isCurrent = queueEntry.timeline_stage === step.stage;

            return (
              <div key={step.stage} className="relative flex items-start space-x-4 group">
                <div
                  className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                      : isCurrent
                      ? 'bg-blue-500 text-white animate-pulse shadow-md shadow-blue-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isDone ? '✓' : isCurrent ? '→' : '○'}
                </div>

                <div className="space-y-0.5">
                  <h4
                    className={`text-sm font-semibold transition ${
                      isDone
                        ? 'text-emerald-400'
                        : isCurrent
                        ? 'text-blue-300 font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancel Ticket Action */}
        {queueEntry.status === 'WAITING' && (
          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="py-2.5 px-5 bg-slate-900 hover:bg-red-500/10 text-red-400 border border-slate-800 hover:border-red-500/30 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Cancel This Queue Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

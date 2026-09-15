import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getLocations, joinQueue } from '../../services/api';
import { Location, Service, QueueEntry } from '../../types/customer';
import {
  Building2, Layers, Users, Clock, PlusCircle, CheckCircle2, Ticket,
  ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, RefreshCw, Eye
} from 'lucide-react';

import { useToast } from '../../contexts/ToastContext';

export const JoinQueuePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();


  const preLocationId = searchParams.get('location_id');
  const preServiceId = searchParams.get('service_id');

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [generatedEntry, setGeneratedEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const data = await getLocations();
        setLocations(data);

        if (preLocationId) {
          const loc = data.find((l) => l.id === Number(preLocationId));
          if (loc) {
            setSelectedLocation(loc);
            if (preServiceId) {
              const srv = loc.services.find((s) => s.id === Number(preServiceId));
              if (srv) setSelectedService(srv);
            }
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load location options');
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [preLocationId, preServiceId]);

  const handleLocationSelect = (locId: number) => {
    const loc = locations.find((l) => l.id === locId) || null;
    setSelectedLocation(loc);
    setSelectedService(null);
  };

  const handleServiceSelect = (srvId: number) => {
    if (!selectedLocation) return;
    const srv = selectedLocation.services.find((s) => s.id === srvId) || null;
    setSelectedService(srv);
  };

  const handleConfirmJoin = async () => {
    if (!selectedLocation || !selectedService) return;

    setSubmitting(true);
    setError(null);
    try {
      const entry = await joinQueue(selectedLocation.id, selectedService.id);
      setGeneratedEntry(entry);
      showToast(`Token ${entry.token_number} generated successfully!`, 'success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail 
        || (err instanceof Error ? err.message : 'Failed to join queue');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 mb-2">
          <Ticket className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Join a Service Queue</h1>
        <p className="text-slate-400 text-sm">
          Select a location and service to view current queue metrics and generate your token.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Token Result View */}
      {generatedEntry ? (
        <div className="glass-panel-glow rounded-3xl p-8 text-center space-y-6 border border-emerald-500/40">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">
              QUEUE TOKEN GENERATED
            </span>
            <h2 className="text-xl font-bold text-white">
              {generatedEntry.location_name} &bull; {generatedEntry.service_name}
            </h2>
          </div>

          <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-2 max-w-sm mx-auto">
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">YOUR TOKEN</span>
            <span className="text-5xl font-black text-blue-400 font-mono tracking-widest block">
              {generatedEntry.token_number}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-center text-xs">
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">People Ahead</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">{generatedEntry.people_ahead}</span>
            </div>
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Estimated Wait</span>
              <span className="text-2xl font-bold text-amber-300 font-mono">{generatedEntry.estimated_wait} min</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/customer/queue/${generatedEntry.id}`)}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>VIEW LIVE QUEUE TRACKING</span>
          </button>
        </div>
      ) : (
        /* Join Queue Step Wizard */
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800">
          {/* Step 1: Select Location */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Step 1: Select Location</span>
            </label>
            <select
              value={selectedLocation?.id || ''}
              onChange={(e) => handleLocationSelect(Number(e.target.value))}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">-- Choose Location --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.type}) &bull; {loc.address}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Service */}
          {selectedLocation && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Step 2: Select Service</span>
              </label>
              <select
                value={selectedService?.id || ''}
                onChange={(e) => handleServiceSelect(Number(e.target.value))}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition"
              >
                <option value="">-- Choose Service --</option>
                {selectedLocation.services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} (Avg Service: {srv.average_service_time} min)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3 & 4: Queue Summary & Confirm */}
          {selectedLocation && selectedService && (
            <div className="space-y-6 pt-4 border-t border-slate-800">
              <div className="glass-panel-glow rounded-2xl p-6 space-y-4 border border-blue-500/20">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">{selectedLocation.name}</h3>
                  <p className="text-xs text-blue-400 font-semibold">{selectedService.name}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">People in Queue</span>
                    <span className="text-lg font-bold text-purple-300 font-mono">
                      {selectedService.people_in_queue}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Active Counters</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {selectedService.active_counters}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Avg Service Time</span>
                    <span className="text-lg font-bold text-slate-200 font-mono">
                      {selectedService.average_service_time} min
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Estimated Wait</span>
                    <span className="text-lg font-bold text-amber-300 font-mono">
                      {selectedService.estimated_wait_minutes} min
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmJoin}
                disabled={submitting}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    <span>JOIN QUEUE & GENERATE TOKEN</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

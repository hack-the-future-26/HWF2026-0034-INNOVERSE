import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLocationById } from '../../services/api';
import { Location } from '../../types/customer';
import {
  Building2, MapPin, Layers, Clock, Users, ArrowLeft, PlusCircle,
  CheckCircle2, AlertTriangle, ShieldCheck, Sparkles
} from 'lucide-react';

export const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getLocationById(Number(id));
        setLocation(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Location not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading location details & service metrics...</p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="font-bold text-slate-100">{error || 'Location Not Found'}</h3>
        <Link
          to="/customer/locations"
          className="inline-flex items-center space-x-1.5 text-xs text-blue-400 font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Locations Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        to="/customer/locations"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Locations</span>
      </Link>

      {/* Location Banner Card */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-0.5 rounded-full">
                {location.type}
              </span>
              <span className="flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OPEN</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{location.name}</h1>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>{location.address}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center sm:w-64">
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Total Queue</span>
              <span className="text-xl font-bold text-purple-300">{location.total_queue_size}</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Avg Wait Time</span>
              <span className="text-xl font-bold text-amber-300">{location.estimated_wait_minutes} m</span>
            </div>
          </div>
        </div>

        {/* Services Header */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Available Services ({location.services.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {location.services.map((srv) => (
              <div
                key={srv.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-100 text-base">{srv.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{srv.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">In Queue</span>
                    <span className="font-bold text-blue-400">{srv.people_in_queue}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Counters</span>
                    <span className="font-bold text-emerald-400">{srv.active_counters}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 font-semibold block flex items-center justify-center space-x-1">
                      <span>AI Est. Wait</span>
                    </span>
                    <span className="font-bold text-amber-300">{srv.estimated_wait_minutes} m</span>
                    <span className="text-[9px] text-emerald-400 block font-bold mt-0.5">
                      {Math.round((srv.confidence ?? 0.87) * 100)}% Conf.
                    </span>
                  </div>

                </div>

                <button
                  onClick={() => navigate(`/customer/join?location_id=${location.id}&service_id=${srv.id}`)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>JOIN QUEUE</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

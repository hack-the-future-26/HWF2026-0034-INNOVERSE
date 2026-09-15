import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLocations } from '../../services/api';
import { Location, LocationType } from '../../types/customer';
import { Building2, Search, MapPin, Layers, Clock, Users, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const data = await getLocations();
        setLocations(data);
        setFilteredLocations(data);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    let result = locations;
    if (selectedType !== 'all') {
      result = result.filter((loc) => loc.type === selectedType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q)
      );
    }
    setFilteredLocations(result);
  }, [searchQuery, selectedType, locations]);

  const categories: { label: string; value: string }[] = [
    { label: 'All Venues', value: 'all' },
    { label: 'Hospitals', value: 'hospital' },
    { label: 'Banks', value: 'bank' },
    { label: 'Retail', value: 'retail' },
    { label: 'Government', value: 'government' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-400" />
          <span>Locations & Queue Catalog</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Browse real-time queue lengths and estimated wait times across all registered service centers.
        </p>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue name or address..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedType(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedType === cat.value
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Locations List Grid */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Fetching live queue metrics...</p>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
          No locations found matching your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="glass-panel-glow rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                      {loc.type}
                    </span>
                    <h2 className="text-xl font-bold text-slate-100 mt-1">{loc.name}</h2>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    {loc.is_open ? (
                      <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>OPEN</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>CLOSED</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{loc.address}</span>
                </div>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px] mb-0.5">
                    <Layers className="w-3 h-3 text-purple-400" />
                    <span>Services</span>
                  </div>
                  <span className="text-base font-bold text-slate-100">{loc.services_count}</span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px] mb-0.5">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span>Queue Size</span>
                  </div>
                  <span className="text-base font-bold text-purple-300">{loc.total_queue_size}</span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px] mb-0.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Est. Wait</span>
                  </div>
                  <span className="text-base font-bold text-amber-300">{loc.estimated_wait_minutes} m</span>
                </div>
              </div>

              {/* Link to Location Detail */}
              <Link
                to={`/customer/location/${loc.id}`}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition"
              >
                <span>View Available Services & Join</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

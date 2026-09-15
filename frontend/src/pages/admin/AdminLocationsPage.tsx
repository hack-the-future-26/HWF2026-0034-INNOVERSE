import React, { useState, useEffect } from 'react';
import { adminGetLocations, adminCreateLocation, adminUpdateLocation, adminDeleteLocation } from '../../services/api';
import { Location, LocationType } from '../../types/customer';
import { Building2, Plus, Edit2, Trash2, MapPin, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export const AdminLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('hospital');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('active');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await adminGetLocations();
      setLocations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreateModal = () => {
    setEditingLoc(null);
    setName('');
    setType('hospital');
    setAddress('');
    setStatus('active');
    setShowModal(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLoc(loc);
    setName(loc.name);
    setType(loc.type);
    setAddress(loc.address);
    setStatus(loc.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLoc) {
        await adminUpdateLocation(editingLoc.id, { name, type, address, status });
      } else {
        await adminCreateLocation({ name, type, address, status });
      }
      setShowModal(false);
      fetchLocations();
    } catch (err: any) {
      alert(err.message || 'Failed to save location');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this location? All associated services & queues will be removed.')) return;
    try {
      await adminDeleteLocation(id);
      fetchLocations();
    } catch (err: any) {
      alert(err.message || 'Failed to delete location');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel-glow rounded-3xl p-6 border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
            <Building2 className="w-7 h-7 text-blue-400" />
            <span>Manage Locations</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">Configure physical venues, branches, and operating statuses.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Locations Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        {loading && locations.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading locations...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">ID</th>
                  <th className="p-3 font-semibold">Location Name</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Address</th>
                  <th className="p-3 font-semibold">Services</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3 font-mono text-slate-500">#{loc.id}</td>
                    <td className="p-3 font-bold text-slate-100">{loc.name}</td>
                    <td className="p-3 text-blue-400 font-semibold capitalize">{loc.type}</td>
                    <td className="p-3 text-slate-400 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{loc.address}</span>
                    </td>
                    <td className="p-3">{loc.services_count || loc.services?.length || 0} Configured</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        loc.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {loc.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-800 space-y-6">
            <h3 className="text-xl font-bold text-white">
              {editingLoc ? 'Edit Location' : 'Add New Location'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. City General Hospital"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LocationType)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="hospital">Hospital</option>
                  <option value="bank">Bank</option>
                  <option value="retail">Retail</option>
                  <option value="government">Government</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 100 Main Street, Suite 400"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Operating Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active (Open)</option>
                  <option value="inactive">Inactive (Closed)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-xs text-slate-400 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

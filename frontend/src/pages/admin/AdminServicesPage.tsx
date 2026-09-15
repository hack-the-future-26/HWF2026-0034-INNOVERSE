import React, { useState, useEffect } from 'react';
import { adminGetServices, adminCreateService, adminUpdateService, adminDeleteService, adminGetLocations } from '../../services/api';
import { Location } from '../../types/customer';
import { Layers, Plus, Edit2, Trash2, Clock, CheckCircle2 } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSrv, setEditingSrv] = useState<any | null>(null);

  // Form State
  const [locationId, setLocationId] = useState<number>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avgTime, setAvgTime] = useState<number>(10);
  const [status, setStatus] = useState('active');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [srvData, locData] = await Promise.all([
        adminGetServices(),
        adminGetLocations()
      ]);
      setServices(srvData);
      setLocations(locData);
      if (locData.length > 0) {
        setLocationId(locData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingSrv(null);
    setName('');
    setDescription('');
    setAvgTime(10);
    setStatus('active');
    setShowModal(true);
  };

  const openEditModal = (srv: any) => {
    setEditingSrv(srv);
    setLocationId(srv.location_id);
    setName(srv.name);
    setDescription(srv.description || '');
    setAvgTime(srv.average_service_time);
    setStatus(srv.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        location_id: locationId,
        name,
        description,
        average_service_time: Number(avgTime),
        status
      };
      if (editingSrv) {
        await adminUpdateService(editingSrv.id, payload);
      } else {
        await adminCreateService(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save service');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await adminDeleteService(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete service');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel-glow rounded-3xl p-6 border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
            <Layers className="w-7 h-7 text-purple-400" />
            <span>Manage Services</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">Configure queue service offerings, descriptions & SLA targets.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        {loading && services.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading services...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">ID</th>
                  <th className="p-3 font-semibold">Service Name</th>
                  <th className="p-3 font-semibold">Location</th>
                  <th className="p-3 font-semibold">Avg Service Time</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {services.map((srv) => {
                  const loc = locations.find((l) => l.id === srv.location_id);

                  return (
                    <tr key={srv.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-mono text-slate-500">#{srv.id}</td>
                      <td className="p-3 font-bold text-slate-100">{srv.name}</td>
                      <td className="p-3 text-blue-400 font-semibold">{loc?.name || `Location #${srv.location_id}`}</td>
                      <td className="p-3 font-mono text-amber-300 font-bold">{srv.average_service_time} mins</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          srv.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {srv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(srv)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(srv.id)}
                          className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
              {editingSrv ? 'Edit Service' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Target Location</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cardiology OPD"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of service scope"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Average Service Time (Minutes)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={avgTime}
                  onChange={(e) => setAvgTime(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

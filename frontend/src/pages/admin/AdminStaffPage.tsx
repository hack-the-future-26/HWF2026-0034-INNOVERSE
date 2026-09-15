import React, { useState, useEffect } from 'react';
import { adminGetStaff, adminCreateStaff, adminGetCounters, adminCreateCounter, adminGetLocations, getOrganizations } from '../../services/api';
import { StaffMember, CounterItem } from '../../types/admin';
import { Location } from '../../types/customer';
import { Organization } from '../../types/staff';
import { Users, Plus, ShieldCheck, UserCheck, Monitor, Building2 } from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [counters, setCounters] = useState<CounterItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal States
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [showCounterModal, setShowCounterModal] = useState<boolean>(false);

  // Staff Form
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('staff123');
  const [staffRole, setStaffRole] = useState('staff');
  const [staffOrgId, setStaffOrgId] = useState<number | undefined>(undefined);

  // Counter Form
  const [counterName, setCounterName] = useState('');
  const [counterLocId, setCounterLocId] = useState<number>(1);
  const [counterStaffId, setCounterStaffId] = useState<number | undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, cData, lData, oData] = await Promise.all([
        adminGetStaff(),
        adminGetCounters(),
        adminGetLocations(),
        getOrganizations()
      ]);
      setStaffList(sData);
      setCounters(cData);
      setLocations(lData);
      setOrganizations(oData);
      if (lData.length > 0) setCounterLocId(lData[0].id);
      if (oData.length > 0) setStaffOrgId(oData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreateStaff({
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole,
        organization_id: staffOrgId
      });
      setShowStaffModal(false);
      setStaffName('');
      setStaffEmail('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create staff account');
    }
  };

  const handleCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreateCounter({
        location_id: counterLocId,
        name: counterName,
        staff_id: counterStaffId || undefined,
        status: 'open'
      });
      setShowCounterModal(false);
      setCounterName('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create counter');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel-glow rounded-3xl p-6 border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
            <Users className="w-7 h-7 text-amber-400" />
            <span>Staff Users & Counters</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage staff credentials, role permissions, and service counters.</p>
        </div>

        <div className="flex space-x-3 self-start sm:self-auto">
          <button
            onClick={() => setShowStaffModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff User</span>
          </button>

          <button
            onClick={() => setShowCounterModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Counter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Configured Staff Accounts ({staffList.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5 font-semibold">Name</th>
                  <th className="p-2.5 font-semibold">Organization</th>
                  <th className="p-2.5 font-semibold">Email</th>
                  <th className="p-2.5 font-semibold">Role</th>
                  <th className="p-2.5 font-semibold">Assigned Counter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-2.5 font-bold text-slate-100">{s.name}</td>
                    <td className="p-2.5">
                      {s.organization_name ? (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded font-medium text-[10px]">
                          {s.organization_name}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-400">{s.email}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-semibold uppercase text-[10px]">
                        {s.role}
                      </span>
                    </td>
                    <td className="p-2.5 text-emerald-400 font-semibold">{s.counter_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Counters Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>Service Counters ({counters.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5 font-semibold">Counter Name</th>
                  <th className="p-2.5 font-semibold">Location</th>
                  <th className="p-2.5 font-semibold">Assigned Staff</th>
                  <th className="p-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {counters.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-2.5 font-bold text-slate-100">{c.name}</td>
                    <td className="p-2.5 text-blue-400 font-semibold">{c.location_name}</td>
                    <td className="p-2.5 text-slate-300">{c.staff_name || 'Unassigned'}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold uppercase text-[10px]">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-800 space-y-6">
            <h3 className="text-xl font-bold text-white">Create Staff User Account</h3>
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="e.g. sarah.staff@smartqueue.com"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Organization</label>
                <select
                  value={staffOrgId || ''}
                  onChange={(e) => setStaffOrgId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Unassigned</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="staff">Staff Operator</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="flex-1 py-2.5 text-xs text-slate-400 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-xl transition"
                >
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counter Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-800 space-y-6">
            <h3 className="text-xl font-bold text-white">Create Service Counter</h3>
            <form onSubmit={handleCounterSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Location</label>
                <select
                  value={counterLocId}
                  onChange={(e) => setCounterLocId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Counter Name</label>
                <input
                  type="text"
                  required
                  value={counterName}
                  onChange={(e) => setCounterName(e.target.value)}
                  placeholder="e.g. Counter 5 (Express Desk)"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Assigned Staff User (Optional)</label>
                <select
                  value={counterStaffId || ''}
                  onChange={(e) => setCounterStaffId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Unassigned</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCounterModal(false)}
                  className="flex-1 py-2.5 text-xs text-slate-400 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition"
                >
                  Create Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

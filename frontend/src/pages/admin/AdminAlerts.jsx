import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, Check, X, Clock } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [unverified, setUnverified] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titleEn: '', descriptionEn: '', type: 'road_blocked', severity: 'yellow', affectedArea: '', alternativeRoute: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [alertsRes, unverifiedRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/admin/alerts/unverified'),
      ]);
      setAlerts(alertsRes.data.data || []);
      setUnverified(unverifiedRes.data.data || []);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/alerts', form);
      toast.success('Alert created');
      setShowForm(false);
      setForm({ titleEn: '', descriptionEn: '', type: 'road_blocked', severity: 'yellow', affectedArea: '', alternativeRoute: '' });
      fetchData();
    } catch (err) { toast.error('Failed to create alert'); }
  };

  const handleVerify = async (id) => {
    try {
      await api.put(`/admin/alerts/${id}/verify`);
      toast.success('Alert verified and published');
      fetchData();
    } catch { toast.error('Failed to verify'); }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/alerts/${id}/resolve`, { note: 'Resolved by admin' });
      toast.success('Alert resolved');
      fetchData();
    } catch { toast.error('Failed to resolve'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this alert?')) return;
    try {
      await api.delete(`/alerts/${id}`);
      toast.success('Alert deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const severityColors = {
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  if (isLoading) return <Loader text="Loading alerts..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts Management</h1>
          <p className="text-gray-500 text-sm mt-1">{alerts.length} active • {unverified.length} pending verification</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary rounded-xl px-5 py-2.5 text-sm">
          <Plus size={16} /> New Alert
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-white/8 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Create Alert</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input type="text" required value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder="Alert title" className="input-field" />
            <div className="grid grid-cols-3 gap-4">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                {['road_blocked','landslide','flood','snow','construction','weather','security','closed','other'].map(t => <option key={t} value={t} className="bg-gray-900 capitalize">{t.replace('_',' ')}</option>)}
              </select>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="input-field">
                <option value="yellow" className="bg-gray-900">⚠️ Caution</option>
                <option value="orange" className="bg-gray-900">🔶 Warning</option>
                <option value="red" className="bg-gray-900">🔴 Danger</option>
              </select>
              <input type="text" value={form.affectedArea} onChange={(e) => setForm({ ...form, affectedArea: e.target.value })} placeholder="Affected area" className="input-field" />
            </div>
            <textarea rows={3} required value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} placeholder="Description..." className="input-field resize-none" />
            <input type="text" value={form.alternativeRoute} onChange={(e) => setForm({ ...form, alternativeRoute: e.target.value })} placeholder="Alternative route (optional)" className="input-field" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 glass rounded-xl text-gray-400">Cancel</button>
              <button type="submit" className="flex-1 py-3 btn-primary rounded-xl">Publish Alert</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Unverified */}
      {unverified.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">⏳ Pending Verification ({unverified.length})</h2>
          <div className="space-y-3">
            {unverified.map(alert => (
              <div key={alert._id} className="glass rounded-xl p-4 border border-yellow-500/20 flex items-center gap-4">
                <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{alert.titleEn}</p>
                  <p className="text-gray-500 text-xs">by {alert.reportedBy?.name || 'User'} • {formatDate(alert.createdAt)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleVerify(alert._id)} className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all"><Check size={14} /></button>
                  <button onClick={() => handleDelete(alert._id)} className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <h2 className="text-lg font-bold text-white mb-3">Active Alerts</h2>
      {alerts.length === 0 ? (
        <div className="text-center py-12 glass rounded-2xl"><p className="text-gray-500">No active alerts</p></div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert._id} className={`glass rounded-xl p-4 border flex items-center gap-4 ${severityColors[alert.severity]}`}>
              <AlertTriangle size={18} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{alert.titleEn}</p>
                <p className="text-xs opacity-70">{alert.affectedArea} • {formatDate(alert.createdAt)}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleResolve(alert._id)} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-600/30 transition-all">Resolve</button>
                <button onClick={() => handleDelete(alert._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAlerts;
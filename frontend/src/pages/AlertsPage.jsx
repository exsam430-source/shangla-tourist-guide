import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, Clock, MapPin, Plus, X } from 'lucide-react';
import { fetchAlerts } from '@/store/slices/alertsSlice';
import { getAlertColor } from '@/utils/helpers';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';

const AlertsPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { alerts, isLoading } = useSelector((state) => state.alerts);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showReportForm, setShowReportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    titleEn: '',
    descriptionEn: '',
    type: 'road_blocked',
    severity: 'yellow',
    affectedArea: '',
  });

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  const severityConfig = {
    green: {
      label: 'All Clear',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      icon: CheckCircle,
    },
    yellow: {
      label: 'Caution',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: AlertTriangle,
    },
    orange: {
      label: 'Warning',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      icon: AlertTriangle,
    },
    red: {
      label: 'Danger',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: AlertTriangle,
    },
  };

  const typeLabels = {
    road_blocked: '🚧 Road Blocked',
    landslide: '⛰️ Landslide',
    flood: '🌊 Flood',
    snow: '❄️ Snow',
    construction: '🏗️ Construction',
    weather: '🌩️ Weather',
    security: '🔒 Security',
    closed: '🚫 Closed',
    other: '⚠️ Other',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to report an alert');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/alerts', form);
      toast.success('Alert reported! Admin will verify shortly.');
      setShowReportForm(false);
      setForm({ titleEn: '', descriptionEn: '', type: 'road_blocked', severity: 'yellow', affectedArea: '' });
      dispatch(fetchAlerts());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit alert');
    } finally {
      setSubmitting(false);
    }
  };

  const activeAlerts = alerts.filter((a) => a.isActive);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-green rounded-full text-green-400 text-sm font-medium mb-4">
            <AlertTriangle size={14} />
            Live Updates
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('alerts.title')}
          </h1>
          <p className="text-gray-400 text-lg">
            Stay informed about road conditions and travel advisories in Shangla
          </p>
        </motion.div>

        {/* Status Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl border mb-8 ${
            activeAlerts.length === 0
              ? 'bg-green-500/10 border-green-500/30'
              : activeAlerts.some((a) => a.severity === 'red')
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}
        >
          <div className="flex items-center gap-4">
            {activeAlerts.length === 0 ? (
              <>
                <CheckCircle size={40} className="text-green-400 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-green-400">All Clear</h2>
                  <p className="text-green-300/70">No active alerts. Roads are safe to travel! ✅</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle size={40} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-yellow-400">
                    {activeAlerts.length} Active Alert{activeAlerts.length > 1 ? 's' : ''}
                  </h2>
                  <p className="text-yellow-300/70">
                    Please review alerts before traveling
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Alerts List */}
        {isLoading ? (
          <Loader text="Loading alerts..." />
        ) : activeAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 glass rounded-2xl"
          >
            <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
            <p className="text-gray-400">All roads are clear. Safe travels! 🏔️</p>
          </motion.div>
        ) : (
          <div className="space-y-4 mb-8">
            {activeAlerts.map((alert, index) => {
              const config = severityConfig[alert.severity] || severityConfig.yellow;
              const Icon = config.icon;
              return (
                <motion.div
                  key={alert._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border ${config.bg} ${config.border}`}
                >
                  <div className="flex items-start gap-4">
                    <Icon size={24} className={`${config.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {typeLabels[alert.type] || alert.type}
                        </span>
                        {alert.isVerified && (
                          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg font-bold ${config.color} mb-1`}>
                        {alert.titleEn}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">{alert.descriptionEn}</p>
                      {alert.affectedArea && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                          <MapPin size={13} />
                          <span>{alert.affectedArea}</span>
                        </div>
                      )}
                      {alert.alternativeRoute && (
                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <p className="text-blue-400 text-sm">
                            <strong>Alternative Route:</strong> {alert.alternativeRoute}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{new Date(alert.createdAt).toLocaleDateString('en-PK', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Report Alert Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {!showReportForm ? (
            <button
              onClick={() => setShowReportForm(true)}
              className="w-full py-4 glass border border-white/10 hover:border-green-500/30 hover:bg-green-500/5 rounded-2xl text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} />
              {t('alerts.reportAlert')}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Report an Issue</h3>
                <button onClick={() => setShowReportForm(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="input-field"
                    >
                      {Object.entries(typeLabels).map(([val, label]) => (
                        <option key={val} value={val} className="bg-gray-900">{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Severity</label>
                    <select
                      value={form.severity}
                      onChange={(e) => setForm({ ...form, severity: e.target.value })}
                      className="input-field"
                    >
                      <option value="yellow" className="bg-gray-900">⚠️ Caution</option>
                      <option value="orange" className="bg-gray-900">🔶 Warning</option>
                      <option value="red" className="bg-gray-900">🔴 Danger</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Affected Area</label>
                  <input
                    type="text"
                    value={form.affectedArea}
                    onChange={(e) => setForm({ ...form, affectedArea: e.target.value })}
                    placeholder="e.g. Shangla Top Road, Alpuri to Besham"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    className="input-field resize-none"
                  />
                </div>
                {!isAuthenticated && (
                  <p className="text-yellow-400 text-sm">⚠️ You must be logged in to report an alert.</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="flex-1 py-3 glass rounded-xl text-gray-400 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !isAuthenticated}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AlertsPage;
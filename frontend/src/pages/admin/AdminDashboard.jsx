import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Users, Star, AlertTriangle, Eye, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import api from '@/utils/api';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) return <Loader text="Loading dashboard..." />;

  const stats = [
    { label: 'Total Places', value: data?.stats?.totalPlaces || 0, icon: MapPin, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Total Users', value: data?.stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Total Reviews', value: data?.stats?.totalReviews || 0, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { label: 'Active Alerts', value: data?.stats?.activeAlerts || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'Total Trips', value: data?.stats?.totalTrips || 0, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Shangla Tourist Admin Panel</p>
        </div>
        <Link to="/admin/places/new" className="btn-primary rounded-xl px-5 py-2.5 text-sm hidden sm:flex">
          <Plus size={16} />
          Add Place
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-5 rounded-2xl ${bg} border ${border}`}
          >
            <Icon size={20} className={`${color} mb-3`} />
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Reviews */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Pending Reviews</h2>
            <Link to="/admin/reviews" className="text-green-400 text-xs hover:text-green-300 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {data?.recentReviews?.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No pending reviews</p>
          ) : (
            <div className="space-y-3">
              {data?.recentReviews?.map((review) => (
                <div key={review._id} className="flex items-start gap-3 p-3 glass rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <Star size={14} className="text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{review.user?.name || 'User'}</p>
                    <p className="text-gray-500 text-xs truncate">on {review.place?.nameEn || 'Place'}</p>
                  </div>
                  <span className="text-yellow-400 text-sm font-bold flex-shrink-0">★{review.rating}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top Places */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Top Places</h2>
            <Link to="/admin/places" className="text-green-400 text-xs hover:text-green-300 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {data?.topPlaces?.length === 0 ? (
            <div className="text-center py-6">
              <MapPin size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No places yet</p>
              <Link to="/admin/places/new" className="btn-ghost text-xs mt-2 inline-flex">Add First Place</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.topPlaces?.map((place, i) => (
                <div key={place._id} className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5">
                  <span className="text-green-400 text-sm font-bold w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{place.nameEn}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" />{place.averageRating || 0}</span>
                      <span className="flex items-center gap-1"><Eye size={10} />{place.viewCount || 0} views</span>
                      <span>{place.totalReviews || 0} reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Users</h2>
            <Link to="/admin/users" className="text-green-400 text-xs hover:text-green-300 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentUsers?.map((user) => (
              <div key={user._id} className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.name}</p>
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                </div>
                <span className="text-gray-600 text-xs">{formatDate(user.createdAt)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/admin/places/new', label: 'Add New Place', icon: Plus, color: 'from-green-500/20 to-green-600/10', border: 'border-green-500/20' },
              { to: '/admin/alerts', label: 'Manage Alerts', icon: AlertTriangle, color: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/20' },
              { to: '/admin/reviews', label: 'Moderate Reviews', icon: Star, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20' },
              { to: '/admin/users', label: 'Manage Users', icon: Users, color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20' },
            ].map(({ to, label, icon: Icon, color, border }) => (
              <Link
                key={to}
                to={to}
                className={`p-4 rounded-xl bg-gradient-to-br ${color} border ${border} hover:scale-[1.02] transition-all text-center`}
              >
                <Icon size={20} className="text-white mx-auto mb-2" />
                <p className="text-white text-xs font-medium">{label}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
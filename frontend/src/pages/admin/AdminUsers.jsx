import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data?.users || []);
      setTotal(data.data?.total || 0);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle-status`);
      toast.success(data.data?.isActive ? 'User activated' : 'User deactivated');
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{total} registered users</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-11" />
      </div>

      {isLoading ? <Loader text="Loading users..." /> : (
        <div className="space-y-2">
          {filtered.map((user, i) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-xl p-4 border border-white/8 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium truncate">{user.name}</p>
                  {user.role === 'admin' && <Shield size={12} className="text-yellow-400 flex-shrink-0" />}
                </div>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full border ${user.isActive ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                <span>{user.languagePreference === 'ur' ? 'اردو' : 'EN'}</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              {user.role !== 'admin' && (
                <button onClick={() => toggleStatus(user._id)} className={`p-2 rounded-lg transition-all ${user.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}>
                  {user.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
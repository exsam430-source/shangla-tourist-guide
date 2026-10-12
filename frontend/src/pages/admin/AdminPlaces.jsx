import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Star, Search, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';

const AdminPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPlaces = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/places', { params: { limit: 100 } });
      setPlaces(data.data || []);
    } catch (err) {
      toast.error('Failed to fetch places');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlaces(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/places/${id}`);
      toast.success('Place deleted');
      fetchPlaces();
    } catch (err) {
      toast.error('Failed to delete place');
    }
  };

  const handleToggleFeatured = async (id, currentState) => {
    try {
      await api.put(`/places/${id}`, { isFeatured: !currentState });
      toast.success(currentState ? 'Removed from featured' : 'Added to featured');
      fetchPlaces();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const filtered = places.filter((p) =>
    p.nameEn?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Places Management</h1>
          <p className="text-gray-500 text-sm mt-1">{places.length} total places</p>
        </div>
        <Link to="/admin/places/new" className="btn-primary rounded-xl px-5 py-2.5 text-sm">
          <Plus size={16} />
          Add New Place
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search places..."
          className="input-field pl-11"
        />
      </div>

      {isLoading ? (
        <Loader text="Loading places..." />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <MapPin size={48} className="text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">No places found</h3>
          <p className="text-gray-400 mb-4">Add your first tourist place to get started</p>
          <Link to="/admin/places/new" className="btn-primary rounded-xl px-6 py-3 inline-flex">
            <Plus size={16} /> Add First Place
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((place, i) => (
            <motion.div
              key={place._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-2xl p-4 border border-white/8 hover:border-white/15 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                  {place.images?.[0]?.url ? (
                    <img src={place.images[0].url} alt={place.nameEn} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏔️</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold truncate">{place.nameEn}</h3>
                    {place.isFeatured && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full border border-green-500/30">Featured</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mb-1.5 truncate">/{place.slug}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-400" />{place.averageRating || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={10} />{place.viewCount || 0} views
                    </span>
                    <span>{place.totalReviews || 0} reviews</span>
                    <span>{place.images?.length || 0} images</span>
                    <span className="capitalize">{place.category?.[0] || 'uncategorized'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleFeatured(place._id, place.isFeatured)}
                    className={`p-2 rounded-lg transition-all ${place.isFeatured ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-600 hover:bg-white/5'}`}
                    title={place.isFeatured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {place.isFeatured ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <Link
                    to={`/places/${place.slug}`}
                    target="_blank"
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    title="View on site"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    to={`/admin/places/edit/${place._id}`}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(place._id, place.nameEn)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPlaces;
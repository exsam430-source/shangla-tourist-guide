import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { User, Heart, Map, Settings, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/helpers';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');

  if (isLoading) return <Loader fullScreen text="Loading profile..." />;
  if (!user) return null;

  const tabs = [
    { id: 'saved', label: 'Saved Places', icon: Heart },
    { id: 'trips', label: 'My Trips', icon: Map },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border border-white/8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-4xl font-bold text-white shadow-glow flex-shrink-0">
              {user.profileImage && !user.profileImage.includes('default') ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-gray-400 mb-3">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="badge-green capitalize">{user.role}</span>
                <span className="badge text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {user.languagePreference === 'en' ? '🇬🇧 English' : '🇵🇰 Urdu'}
                </span>
                <span className="text-xs text-gray-500">
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Saved', value: user.savedPlaces?.length || 0, icon: '❤️' },
                { label: 'Reviews', value: 0, icon: '⭐' },
                { label: 'Trips', value: 0, icon: '🗺️' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="glass rounded-xl p-3">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'glass border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'saved' && (
            <div>
              {user.savedPlaces?.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl">
                  <Heart size={48} className="text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">No saved places yet</h3>
                  <p className="text-gray-400 mb-4">Explore Shangla and save your favorite places</p>
                  <Link to="/places" className="btn-primary rounded-xl px-6 py-3 inline-flex">
                    Explore Places
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.savedPlaces?.map((place) => (
                    <Link
                      key={place._id || place}
                      to={`/places/${place.slug || place}`}
                      className="glass rounded-2xl p-4 border border-white/8 hover:border-green-500/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        {place.images?.[0]?.url && (
                          <img src={place.images[0].url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        )}
                        <div>
                          <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                            {place.nameEn || 'Saved Place'}
                          </h3>
                          {place.averageRating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Star size={10} className="text-yellow-400 fill-yellow-400" />
                              {place.averageRating}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="text-center py-16 glass rounded-2xl">
              <Map size={48} className="text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">No trips planned yet</h3>
              <p className="text-gray-400 mb-4">Use our AI trip planner to create your perfect Shangla itinerary</p>
              <Link to="/trip-planner" className="btn-primary rounded-xl px-6 py-3 inline-flex">
                Plan a Trip
              </Link>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-16 glass rounded-2xl">
              <Star size={48} className="text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">No reviews yet</h3>
              <p className="text-gray-400">Visit places and share your experience</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glass rounded-2xl p-6 border border-white/8">
              <h3 className="text-lg font-bold text-white mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                  <div>
                    <p className="text-white font-medium">Name</p>
                    <p className="text-gray-400 text-sm">{user.name}</p>
                  </div>
                  <button className="text-green-400 text-sm hover:text-green-300 transition-colors">Edit</button>
                </div>
                <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                  <div>
                    <p className="text-white font-medium">Language</p>
                    <p className="text-gray-400 text-sm">{user.languagePreference === 'en' ? 'English' : 'اردو'}</p>
                  </div>
                  <button className="text-green-400 text-sm hover:text-green-300 transition-colors">Change</button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  Mountain, Menu, X, Globe, User, LogOut,
  MapPin, Compass, Bell, Brain, Search,
  ChevronDown, Heart, Mic
} from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/store/slices/authSlice';
import { toggleChat } from '@/store/slices/chatSlice';
import { fetchAlerts } from '@/store/slices/alertsSlice';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts } = useSelector((state) => state.alerts);

  const activeAlerts = alerts.filter((a) => a.isActive).length;

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: Mountain },
    { to: '/places', label: t('nav.places'), icon: MapPin },
    { to: '/trip-planner', label: t('nav.tripPlanner'), icon: Compass },
    { to: '/image-search', label: t('nav.imageSearch'), icon: Search },
    {
      to: '/alerts',
      label: t('nav.alerts'),
      icon: Bell,
      badge: activeAlerts > 0 ? activeAlerts : null,
    },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl'
          : 'bg-transparent'
          }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <span className="text-lg">🏔️</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse-slow" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold gradient-text leading-none">
                  Shangla
                </h1>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                  Tourist Guide
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon, badge }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(to)
                    ? 'text-green-400 bg-green-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={15} />
                  {label}
                  {badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">

              {/* AI Chat Button */}
              <motion.button
                onClick={() => dispatch(toggleChat())}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/80 to-green-700/80 hover:from-green-500 hover:to-green-600 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-glow-sm"
              >
                <Brain size={15} />
                <span className="hidden md:inline">AI Guide</span>
              </motion.button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-gray-400 hover:text-white text-sm transition-all duration-300 hover:bg-white/10"
              >
                <Globe size={15} />
                <span className="font-medium">
                  {i18n.language === 'en' ? 'اردو' : 'EN'}
                </span>
              </button>

              {/* Auth Section */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 glass rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm text-gray-300 font-medium max-w-[80px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-52 glass-dark rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                          >
                            <User size={15} /> {t('nav.profile')}
                          </Link>
                          <Link
                            to="/profile?tab=saved"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                          >
                            <Heart size={15} /> {t('nav.savedPlaces')}
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 px-3 py-2.5 text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/5 rounded-xl transition-all"
                            >
                              <LayoutDashboard size={15} /> Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all"
                          >
                            <LogOut size={15} /> {t('nav.logout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-xl transition-all duration-300"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 glass rounded-xl text-gray-400 hover:text-white transition-all"
              >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl"
            >
              <div className="container-custom py-4 space-y-1">
                {navLinks.map(({ to, label, icon: Icon, badge }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(to)
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon size={18} />
                    {label}
                    {badge && (
                      <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </Link>
                ))}

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <button
                    onClick={() => { dispatch(toggleChat()); setIsMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-green-600/20 text-green-400 rounded-xl text-sm font-medium"
                  >
                    <Brain size={18} /> AI Guide
                  </button>

                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl text-sm">
                        <User size={18} /> {t('nav.profile')}
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-yellow-400 hover:bg-yellow-500/5 rounded-xl text-sm">
                          <LayoutDashboard size={18} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/5 rounded-xl text-sm">
                        <LogOut size={18} /> {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Link to="/login" className="flex-1 px-4 py-3 glass text-center text-sm rounded-xl text-gray-300">
                        {t('nav.login')}
                      </Link>
                      <Link to="/register" className="flex-1 px-4 py-3 bg-green-600 text-center text-sm rounded-xl text-white font-medium">
                        {t('nav.register')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Overlay for profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
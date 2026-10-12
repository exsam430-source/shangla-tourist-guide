import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, MapPin, Image, MessageSquare, AlertTriangle,
  Users, Settings, ChevronLeft, ChevronRight, LogOut, Plus,
  Menu, X, Mountain, Star, Bell, BarChart3
} from 'lucide-react';
import Loader from '@/components/common/Loader';

const AdminLayout = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isLoading) return <Loader fullScreen text="Loading admin panel..." />;
  if (!user || user.role !== 'admin') return null;

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/places', label: 'Places', icon: MapPin },
    { path: '/admin/places/new', label: 'Add Place', icon: Plus },
    { path: '/admin/reviews', label: 'Reviews', icon: Star },
    { path: '/admin/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/admin/users', label: 'Users', icon: Users },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-40 transition-all duration-300 border-r border-white/5 bg-[#0d0d0d] ${sidebarOpen ? 'w-64' : 'w-20'}`}>

        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 shadow-glow">
              <span className="text-lg">🏔️</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-white font-bold text-sm leading-none">Shangla Admin</h1>
                <p className="text-green-400 text-[10px] mt-0.5">Management Panel</p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon, exact }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(path, exact)
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            {sidebarOpen && <span className="text-xs">Collapse</span>}
          </button>
        </div>

        {/* User */}
        <div className="p-3 border-t border-white/5">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-gray-600 text-xs truncate">{user.email}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="flex gap-2 mt-3">
              <Link to="/" className="flex-1 px-3 py-1.5 glass rounded-lg text-xs text-gray-400 hover:text-white text-center transition-all">
                View Site
              </Link>
              <button
                onClick={logout}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 text-center transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d] border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400 hover:text-white">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🏔️</span>
            <span className="text-white font-bold text-sm">Admin</span>
          </div>
        </div>
        <Link to="/" className="text-xs text-gray-500 hover:text-white">View Site →</Link>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/70 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed top-0 left-0 h-full w-64 bg-[#0d0d0d] border-r border-white/5 z-50 py-16 px-3"
            >
              <nav className="space-y-1">
                {navItems.map(({ path, label, icon: Icon, exact }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(path, exact)
                        ? 'bg-green-500/15 text-green-400'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pt-14 lg:pt-0`}>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
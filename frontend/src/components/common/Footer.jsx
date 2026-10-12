import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mountain, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-glow">
                <span>🏔️</span>
              </div>
              <div>
                <h3 className="text-white font-bold leading-none">Shangla Tourist</h3>
                <p className="text-green-400 text-xs">AI-Powered Guide</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t('footer.tagline')} — Discover the untouched paradise of Shangla, KPK Pakistan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/places', label: 'All Places' },
                { to: '/trip-planner', label: 'Trip Planner' },
                { to: '/image-search', label: 'Image Search' },
                { to: '/alerts', label: 'Road Alerts' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-500 hover:text-green-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Places */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Top Places</h4>
            <ul className="space-y-2.5">
              {[
                'Shangla Top', 'Achar Top', 'Alpuri', 'Shahpur Valley',
                'Chakesar Valley', 'Puran Valley',
              ].map((place) => (
                <li key={place}>
                  <Link to="/places" className="text-gray-500 hover:text-green-400 text-sm transition-colors flex items-center gap-1.5">
                    <MapPin size={11} className="text-green-600" />
                    {place}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Emergency */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Emergency</h4>
            <ul className="space-y-2.5">
              {[
                { icon: Phone, label: 'Police: 15' },
                { icon: Phone, label: 'Rescue: 1122' },
                { icon: Phone, label: 'Ambulance: 115' },
                { icon: MapPin, label: 'Alpuri DHQ Hospital' },
                { icon: Mail, label: 'info@shanglatourist.com' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-gray-500 text-sm">
                  <Icon size={12} className="text-green-600 flex-shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="divider mb-6" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © {year} Shangla Tourist. {t('footer.rights')}.
          </p>
          <p className="text-gray-600 text-sm">{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
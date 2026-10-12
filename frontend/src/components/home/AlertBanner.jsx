import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const AlertBanner = () => {
  const { alerts } = useSelector((state) => state.alerts);
  const [dismissed, setDismissed] = useState(false);

  const activeAlerts = alerts.filter((a) => a.isActive && a.severity !== 'green');

  if (dismissed || activeAlerts.length === 0) return null;

  const highestSeverity = activeAlerts.find((a) => a.severity === 'red')
    || activeAlerts.find((a) => a.severity === 'orange')
    || activeAlerts[0];

  const severityColors = {
    red: 'bg-red-500/20 border-red-500/40 text-red-300',
    orange: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
    yellow: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`fixed top-16 md:top-20 left-0 right-0 z-40 border-b ${severityColors[highestSeverity.severity]} backdrop-blur-xl`}
      >
        <div className="container-custom py-2.5 flex items-center gap-3">
          <AlertTriangle size={15} className="flex-shrink-0 animate-pulse" />
          <p className="flex-1 text-sm font-medium truncate">
            <span className="font-bold mr-2">Alert:</span>
            {highestSeverity.titleEn}
            {activeAlerts.length > 1 && (
              <span className="ml-2 text-xs opacity-70">+{activeAlerts.length - 1} more</span>
            )}
          </p>
          <Link
            to="/alerts"
            className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity flex-shrink-0"
          >
            View <ChevronRight size={12} />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertBanner;
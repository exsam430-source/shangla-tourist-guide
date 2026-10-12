import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';

const stats = [
  { value: 25, suffix: '+', label: 'Tourist Places', icon: '🏔️', description: 'Documented locations' },
  { value: 4.8, suffix: '/5', label: 'Average Rating', icon: '⭐', description: 'From traveler reviews' },
  { value: 100, suffix: '%', label: 'Local Data', icon: '🤖', description: 'AI trained on Shangla' },
  { value: 2, suffix: '', label: 'Languages', icon: '🌐', description: 'English & Urdu' },
];

const CountUp = ({ target, suffix, isDecimal }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, isDecimal]);

  return (
    <span>
      {isDecimal ? count.toFixed(1) : count}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section ref={ref} className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ value, suffix, label, icon, description }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-6 text-center border border-white/8 hover:border-green-500/20 transition-all duration-300 card-hover"
            >
              <div className="text-4xl mb-3">{icon}</div>
              <div className="text-3xl font-black gradient-text mb-1">
                {inView ? (
                  <CountUp
                    target={value}
                    suffix={suffix}
                    isDecimal={!Number.isInteger(value)}
                  />
                ) : '0'}
              </div>
              <p className="text-white font-semibold text-sm mb-1">{label}</p>
              <p className="text-gray-500 text-xs">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
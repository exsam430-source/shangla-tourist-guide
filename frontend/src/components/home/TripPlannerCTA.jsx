import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, DollarSign, Calendar, Users, ArrowRight } from 'lucide-react';

const TripPlannerCTA = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-green rounded-full text-green-400 text-sm font-medium mb-6">
              <Compass size={14} /> AI Trip Planner
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Let AI Plan Your{' '}
              <span className="gradient-text">Perfect Trip</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Tell us your budget, duration, and interests. Our AI will create a complete day-by-day itinerary tailored specifically for you.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: DollarSign, label: 'Budget Planning', desc: 'Costs estimated for everything' },
                { icon: Calendar, label: 'Day by Day', desc: 'Hour-by-hour schedule' },
                { icon: Users, label: 'Group Friendly', desc: 'Solo to large groups' },
                { icon: Compass, label: 'Smart Routes', desc: 'Optimized travel paths' },
              ].map((feature) => (
                <div key={feature.label} className="glass rounded-xl p-4 border border-white/5">
                  <feature.icon size={18} className="text-green-400 mb-2" />
                  <p className="text-white text-sm font-semibold">{feature.label}</p>
                  <p className="text-gray-500 text-xs mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
            <Link to="/trip-planner">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary text-lg px-8 py-4"
              >
                <Compass size={20} />
                Plan My Trip
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-6 border border-white/5"
          >
            <div className="space-y-3">
              <div className="glass-green rounded-2xl p-4 border border-green-500/20">
                <p className="text-green-400 text-sm font-medium mb-1">🤖 AI Trip Plan Generated!</p>
                <p className="text-white font-bold">2-Day Shangla Adventure</p>
                <p className="text-gray-400 text-sm">Budget: Rs. 10,000 • 2 People</p>
              </div>
              {[
                { day: 'Day 1', time: '08:00', activity: '🚗 Depart from Islamabad', cost: '' },
                { day: '', time: '14:00', activity: '🏔️ Shangla Top - Explore viewpoint', cost: 'Free' },
                { day: '', time: '18:00', activity: '🏨 Check-in Guest House', cost: 'Rs. 2,000' },
                { day: 'Day 2', time: '09:00', activity: '📸 Achar Top via link road', cost: '' },
                { day: '', time: '14:00', activity: '🍽️ Lunch & Return Journey', cost: 'Rs. 500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-12 text-right text-gray-600 text-xs shrink-0">
                    {item.day && <span className="text-green-400 font-bold">{item.day}</span>}
                    {!item.day && item.time}
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-gray-300">{item.activity}</span>
                    {item.cost && <span className="text-green-400 text-xs font-medium">{item.cost}</span>}
                  </div>
                </div>
              ))}
              <div className="glass-green rounded-xl p-3 border border-green-500/20 text-center">
                <p className="text-green-400 font-bold">Total: Rs. 8,700 ✅ Within Budget!</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TripPlannerCTA;
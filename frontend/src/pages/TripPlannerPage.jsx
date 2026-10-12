import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Compass, Users, Clock, DollarSign, Car, Home, Zap,
  ArrowLeft, ArrowRight, MapPin, Utensils, Bed, Camera,
  Download, Share2, RotateCcw, CheckCircle, AlertCircle,
  Navigation, Coffee, Star,
} from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

// ─── Constants ───────────────────────────────────────────────────────────────

const INTERESTS = [
  { id: 'mountains',   label: '🏔️ Mountains'    },
  { id: 'waterfalls',  label: '🌊 Waterfalls'    },
  { id: 'forests',     label: '🌲 Forests'       },
  { id: 'photography', label: '📸 Photography'   },
  { id: 'camping',     label: '⛺ Camping'       },
  { id: 'trekking',    label: '🥾 Trekking'      },
  { id: 'culture',     label: '🏘️ Culture'       },
  { id: 'scenic',      label: '🌅 Scenic Views'  },
  { id: 'adventure',   label: '🧗 Adventure'     },
  { id: 'historical',  label: '🕌 Historical'    },
];

const CITIES = [
  'Islamabad', 'Peshawar', 'Lahore', 'Karachi',
  'Swat', 'Besham', 'Mardan', 'Abbottabad', 'Other',
];

const STAY_OPTIONS = [
  { value: 'hotel',      label: '🏨 Hotel',       price: '~Rs.3K',    cost: 3000 },
  { value: 'guesthouse', label: '🏠 Guest House',  price: '~Rs.1.5K',  cost: 1500 },
  { value: 'camping',    label: '⛺ Camping',      price: '~Rs.300',   cost: 300  },
  { value: 'homestay',   label: '🏡 Homestay',     price: '~Rs.800',   cost: 800  },
  { value: 'any',        label: '🔀 Any',          price: 'Best value', cost: 1200 },
];

const TRANSPORT_OPTIONS = [
  { value: 'own_car', label: '🚗 Own Car',          cost: 800  },
  { value: 'public',  label: '🚌 Public Transport',  cost: 400  },
  { value: 'rental',  label: '🚙 Rental Car',        cost: 3000 },
  { value: 'mixed',   label: '🔀 Mixed',             cost: 600  },
];

const SHANGLA_PLACES = [
  { name: 'Shangla Top',     time: '2-3 hours',  type: 'viewpoint', cost: 0,   icon: '🏔️' },
  { name: 'Achar Top',       time: '2 hours',    type: 'viewpoint', cost: 0,   icon: '🏔️' },
  { name: 'Alpuri City',     time: '1-2 hours',  type: 'cultural',  cost: 200, icon: '🏘️' },
  { name: 'Shahpur Valley',  time: '3-4 hours',  type: 'valley',    cost: 0,   icon: '🌿' },
  { name: 'Chakesar Valley', time: '3 hours',    type: 'valley',    cost: 0,   icon: '🌄' },
  { name: 'Puran Valley',    time: 'Half day',   type: 'valley',    cost: 0,   icon: '💧' },
  { name: 'Lilownai',        time: '2 hours',    type: 'scenic',    cost: 0,   icon: '🌲' },
  { name: 'Kana Hill',       time: '2-3 hours',  type: 'viewpoint', cost: 0,   icon: '👁️' },
  { name: 'Martung',         time: '1-2 hours',  type: 'cultural',  cost: 0,   icon: '🏘️' },
  { name: 'Daral Lake',      time: '3-4 hours',  type: 'lake',      cost: 100, icon: '🏊' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getActivityColor = (type) => {
  const map = {
    travel:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    food:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
    stay:     'text-purple-400 bg-purple-500/10 border-purple-500/20',
    visit:    'text-green-400 bg-green-500/10 border-green-500/20',
    activity: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    rest:     'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  };
  return map[type] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
};

const getActivityIcon = (type) => {
  const map = {
    travel:   <Car size={14} />,
    food:     <Utensils size={14} />,
    stay:     <Bed size={14} />,
    visit:    <MapPin size={14} />,
    activity: <Camera size={14} />,
    rest:     <Coffee size={14} />,
  };
  return map[type] || <MapPin size={14} />;
};

// ─── Fallback plan generator ─────────────────────────────────────────────────

const generateFallbackPlan = (formData) => {
  const days      = Math.max(1, parseInt(formData.durationDays) || 1);
  const budget    = Math.max(1000, parseInt(formData.budget) || 1000);
  const group     = Math.max(1, parseInt(formData.groupSize) || 2);
  const city      = formData.startLocation?.city || 'Islamabad';

  const stayOpt   = STAY_OPTIONS.find(o => o.value === formData.stayPreference) || STAY_OPTIONS[1];
  const transOpt  = TRANSPORT_OPTIONS.find(o => o.value === formData.transportType) || TRANSPORT_OPTIONS[0];

  const stayPrice  = stayOpt.cost  * Math.ceil(group / 2);
  const transPrice = transOpt.cost * group;

  let totalTransport  = 0;
  let totalFood       = 0;
  let totalStay       = 0;
  let totalActivities = 0;

  let placeIdx = 0;
  const planDays = [];

  for (let d = 1; d <= days; d++) {
    const activities = [];

    // ── Day 1: Travel day ──────────────────────────────────────────
    if (d === 1) {
      activities.push({
        time: '06:00', icon: '🌅', type: 'activity', cost: 0,
        activity: 'Wake up & prepare for trip',
        notes: 'Check weather forecast before leaving',
      });
      activities.push({
        time: '07:00', icon: '🚗', type: 'travel', cost: transPrice,
        activity: `Depart from ${city}`,
        notes: 'Start early to enjoy the full day',
      });
      activities.push({
        time: '10:00', icon: '☕', type: 'rest', cost: 100 * group,
        activity: 'Tea break at Swabi',
      });
      activities.push({
        time: '13:00', icon: '🍽️', type: 'food', cost: 400 * group,
        activity: 'Lunch at Besham — Chapli Kebab & Karahi',
        notes: 'Besham has excellent local food. Must try!',
      });
      activities.push({
        time: '14:30', icon: '⛽', type: 'rest', cost: 0,
        activity: 'Fuel up at Besham fuel station',
      });
      if (SHANGLA_PLACES[placeIdx]) {
        const pl = SHANGLA_PLACES[placeIdx++];
        activities.push({
          time: '16:00', icon: pl.icon, type: 'visit',
          cost: pl.cost * group,
          activity: `Arrive & explore ${pl.name}`,
          placeName: pl.name, duration: pl.time,
          notes: 'Take your time to enjoy the panoramic views!',
        });
      }
      activities.push({
        time: '18:30', icon: '🏨', type: 'stay', cost: stayPrice,
        activity: `Check-in — ${stayOpt.label} near Shangla Top`,
        notes: `${stayOpt.label} accommodation`,
      });
      activities.push({
        time: '19:30', icon: '🍽️', type: 'food', cost: 500 * group,
        activity: 'Dinner at local restaurant',
        notes: 'Try the fresh mountain trout if available!',
      });
      activities.push({
        time: '21:00', icon: '⭐', type: 'activity', cost: 0,
        activity: 'Stargazing at Shangla Top',
        notes: 'The sky is incredibly clear at this altitude!',
      });

    // ── Last day: Return ───────────────────────────────────────────
    } else if (d === days && days > 1) {
      activities.push({
        time: '06:00', icon: '🌅', type: 'activity', cost: 0,
        activity: 'Wake up for sunrise at Shangla Top',
        notes: 'Sunrise here is absolutely breathtaking!',
      });
      activities.push({
        time: '07:30', icon: '☕', type: 'food', cost: 250 * group,
        activity: 'Breakfast at accommodation',
      });
      activities.push({
        time: '09:00', icon: '📸', type: 'activity', cost: 200 * group,
        activity: 'Last photography & souvenir shopping',
        notes: 'Buy local handicrafts and honey as souvenirs',
      });
      activities.push({
        time: '10:30', icon: '🚗', type: 'travel', cost: transPrice,
        activity: `Begin return journey to ${city}`,
      });
      activities.push({
        time: '13:30', icon: '🍽️', type: 'food', cost: 350 * group,
        activity: 'Lunch at Besham on the way back',
      });
      activities.push({
        time: '17:00', icon: '🏠', type: 'travel', cost: 0,
        activity: `Arrive safely in ${city}`,
        notes: "Trip complete! Don't forget to leave a review 😊",
      });

    // ── Middle days: Explore ───────────────────────────────────────
    } else {
      activities.push({
        time: '06:30', icon: '🌄', type: 'activity', cost: 0,
        activity: 'Early morning walk & fresh mountain air',
      });
      activities.push({
        time: '08:00', icon: '☕', type: 'food', cost: 200 * group,
        activity: 'Breakfast — Local Paratha with Chai',
      });

      const placesThisDay = Math.min(2, SHANGLA_PLACES.length - placeIdx);
      let visitHour = 9;

      for (let p = 0; p < placesThisDay; p++) {
        if (placeIdx < SHANGLA_PLACES.length) {
          const pl = SHANGLA_PLACES[placeIdx++];
          activities.push({
            time: `${String(visitHour).padStart(2, '0')}:00`,
            icon: pl.icon, type: 'visit',
            cost: pl.cost * group,
            activity: `Visit ${pl.name}`,
            placeName: pl.name, duration: pl.time,
          });
          visitHour += 3;
        }
      }

      activities.push({
        time: '13:00', icon: '🍽️', type: 'food', cost: 350 * group,
        activity: 'Lunch at local dhaba',
        notes: 'Try the fresh trout fish if available!',
      });
      activities.push({
        time: '15:00', icon: '🫖', type: 'rest', cost: 100 * group,
        activity: 'Rest & traditional Namkeen Chai',
      });
      activities.push({
        time: '16:30', icon: '🏘️', type: 'activity', cost: 0,
        activity: 'Explore local village & meet locals',
        notes: 'Greet with As-salamu alaykum — very welcomed!',
      });
      activities.push({
        time: '18:00', icon: '📸', type: 'activity', cost: 0,
        activity: 'Sunset photography session',
      });
      activities.push({
        time: '19:30', icon: '🍽️', type: 'food', cost: 500 * group,
        activity: 'Dinner — BBQ & Fresh Naan',
      });
      activities.push({
        time: '21:00', icon: '🏨', type: 'stay', cost: stayPrice,
        activity: 'Relax at accommodation',
      });
    }

    // Tally costs
    activities.forEach((a) => {
      const c = a.cost || 0;
      if (a.type === 'travel')                     totalTransport  += c;
      else if (a.type === 'food')                  totalFood       += c;
      else if (a.type === 'stay')                  totalStay       += c;
      else if (a.type === 'visit' || a.type === 'activity') totalActivities += c;
    });

    planDays.push({
      dayNumber: d,
      title:
        d === 1              ? `Day ${d} — Journey to Shangla` :
        d === days && days > 1 ? `Day ${d} — Return to ${city}` :
                               `Day ${d} — Exploring Shangla`,
      activities,
      totalCost: activities.reduce((s, a) => s + (a.cost || 0), 0),
    });
  }

  const misc       = Math.floor(budget * 0.05);
  const grandTotal = totalTransport + totalFood + totalStay + totalActivities + misc;
  const withinBudget = grandTotal <= budget;

  return {
    title: `${days}-Day Shangla Adventure`,
    plan: {
      days: planDays,
      totalEstimatedCost: {
        transport:  totalTransport,
        food:       totalFood,
        stay:       totalStay,
        activities: totalActivities,
        misc,
        total:      grandTotal,
      },
      isWithinBudget: withinBudget,
      aiNotes: withinBudget
        ? `✅ Your ${days}-day trip for ${group} people fits within your budget of Rs. ${budget.toLocaleString()}! Enjoy exploring the beautiful Shangla district.`
        : `⚠️ Estimated cost (Rs. ${grandTotal.toLocaleString()}) slightly exceeds your budget (Rs. ${budget.toLocaleString()}). Consider budget accommodation or reducing days.`,
    },
  };
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TripPlannerPage = () => {
  const { t }              = useTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [step,            setStep]            = useState(1);
  const [isGenerating,    setIsGenerating]    = useState(false);
  const [generatedPlan,   setGeneratedPlan]   = useState(null);
  const [activeDayIndex,  setActiveDayIndex]  = useState(0);

  const [form, setForm] = useState({
    budget:          '',
    durationDays:    '',
    groupSize:       '2',
    interests:       [],
    transportType:   'own_car',
    stayPreference:  'guesthouse',
    startLocation:   { city: 'Islamabad' },
  });

  // ── Helpers ────────────────────────────────────────────────────

  const toggleInterest = (id) =>
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));

  // ── Generate plan ──────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!form.budget || !form.durationDays) {
      toast.error('Please fill budget and duration');
      return;
    }
    if (parseInt(form.budget) < 1000) {
      toast.error('Minimum budget is Rs. 1,000');
      return;
    }
    if (parseInt(form.durationDays) < 1 || parseInt(form.durationDays) > 14) {
      toast.error('Duration must be 1-14 days');
      return;
    }

    setIsGenerating(true);

    try {
      // Try AI server first
      const { data } = await api.post('/trips/generate', form);
      const plan = data?.data;

      if (plan && plan.plan && Array.isArray(plan.plan.days) && plan.plan.days.length > 0) {
        setGeneratedPlan(plan);
      } else {
        throw new Error('Invalid plan structure from server');
      }
    } catch {
      // Use local fallback generator
      try {
        const fallback = generateFallbackPlan(form);
        setGeneratedPlan(fallback);
      } catch (fallbackErr) {
        console.error('Fallback plan error:', fallbackErr);
        toast.error('Failed to generate plan. Please check your inputs.');
        setIsGenerating(false);
        return;
      }
    }

    setActiveDayIndex(0);
    setStep(3);
    toast.success('Your trip plan is ready! 🎒');
    setIsGenerating(false);
  };

  // ── Share ──────────────────────────────────────────────────────

  const handleShare = () => {
    if (!generatedPlan) return;
    const days  = generatedPlan?.plan?.days || [];
    const total = generatedPlan?.plan?.totalEstimatedCost?.total || 0;

    const text =
      `My ${generatedPlan.title}:\n\n` +
      days.map((day) =>
        `${day.title}\n` +
        (day.activities || []).map((a) => `  ${a.time} — ${a.activity}`).join('\n')
      ).join('\n\n') +
      `\n\nTotal: Rs. ${total.toLocaleString()}` +
      `\n\nPlanned on Shangla Tourist Website 🏔️`;

    if (navigator.share) {
      navigator.share({ title: generatedPlan.title, text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Trip plan copied to clipboard! 📋');
    }
  };

  // ── Download ───────────────────────────────────────────────────

  const handleDownload = () => {
    if (!generatedPlan) return;
    const days  = generatedPlan?.plan?.days || [];
    const costs = generatedPlan?.plan?.totalEstimatedCost || {};

    let txt = '';
    txt += `═══════════════════════════════════════\n`;
    txt += `  ${generatedPlan.title}\n`;
    txt += `  Shangla Tourist — AI Trip Planner\n`;
    txt += `═══════════════════════════════════════\n\n`;
    txt += `Group : ${form.groupSize} people\n`;
    txt += `From  : ${form.startLocation?.city}\n`;
    txt += `Stay  : ${form.stayPreference}\n\n`;

    days.forEach((day) => {
      txt += `───────────────────────────────────────\n`;
      txt += `  ${day.title}\n`;
      txt += `───────────────────────────────────────\n`;
      (day.activities || []).forEach((a) => {
        txt += `  ${a.time}  ${a.icon || '•'} ${a.activity}`;
        if (a.cost > 0) txt += ` (Rs. ${a.cost.toLocaleString()})`;
        txt += '\n';
        if (a.notes) txt += `         💡 ${a.notes}\n`;
      });
      txt += `  Day Total : Rs. ${(day.totalCost || 0).toLocaleString()}\n\n`;
    });

    txt += `═══════════════════════════════════════\n`;
    txt += `  COST BREAKDOWN\n`;
    txt += `═══════════════════════════════════════\n`;
    txt += `  Transport  : Rs. ${(costs.transport  || 0).toLocaleString()}\n`;
    txt += `  Food       : Rs. ${(costs.food       || 0).toLocaleString()}\n`;
    txt += `  Stay       : Rs. ${(costs.stay       || 0).toLocaleString()}\n`;
    txt += `  Activities : Rs. ${(costs.activities || 0).toLocaleString()}\n`;
    txt += `  Misc       : Rs. ${(costs.misc       || 0).toLocaleString()}\n`;
    txt += `  ─────────────────────────────────────\n`;
    txt += `  TOTAL      : Rs. ${(costs.total      || 0).toLocaleString()}\n`;
    txt += `═══════════════════════════════════════\n`;

    const blob = new Blob([txt], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${(generatedPlan.title || 'trip').replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Trip plan downloaded! 📥');
  };

  // ── Reset ──────────────────────────────────────────────────────

  const resetPlanner = () => {
    setStep(1);
    setGeneratedPlan(null);
    setActiveDayIndex(0);
    setForm({
      budget: '', durationDays: '', groupSize: '2', interests: [],
      transportType: 'own_car', stayPreference: 'guesthouse',
      startLocation: { city: 'Islamabad' },
    });
  };

  // ── Safe accessors ─────────────────────────────────────────────

  const planDays   = generatedPlan?.plan?.days || [];
  const planCosts  = generatedPlan?.plan?.totalEstimatedCost || {};
  const planTotal  = planCosts.total || 0;
  const planNotes  = generatedPlan?.plan?.aiNotes || '';
  const withinBudget = generatedPlan?.plan?.isWithinBudget !== false;

  const activeDay        = planDays[activeDayIndex] || null;
  const activeDayTitle   = activeDay?.title || '';
  const activeDayTotal   = activeDay?.totalCost || 0;
  const activeDayActvs   = activeDay?.activities || [];

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-green rounded-full text-green-400 text-sm font-medium mb-4">
            <Compass size={14} />
            AI-Powered Trip Planner
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('tripPlanner.title')}
          </h1>
          <p className="text-gray-400 text-lg">{t('tripPlanner.subtitle')}</p>
        </motion.div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[
            { num: 1, label: 'Trip Details' },
            { num: 2, label: 'Interests'    },
            { num: 3, label: 'Your Plan'    },
          ].map(({ num, label }) => (
            <div key={num} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === num
                    ? 'bg-green-600 text-white shadow-glow scale-110'
                    : step > num
                    ? 'bg-green-600/50 text-green-200'
                    : 'glass text-gray-500 border border-white/10'
                }`}
              >
                {step > num ? '✓' : num}
              </div>
              <span className={`hidden sm:block text-xs font-medium ${step >= num ? 'text-green-400' : 'text-gray-600'}`}>
                {label}
              </span>
              {num < 3 && (
                <div className={`w-8 sm:w-16 h-0.5 transition-all ${step > num ? 'bg-green-600' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Steps ── */}
        <AnimatePresence mode="wait">

          {/* ══ STEP 1 ══ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-2xl p-6 md:p-8 border border-white/8"
            >
              <h2 className="text-xl font-bold text-white mb-6">Tell us about your trip</h2>

              <div className="space-y-6">

                {/* Budget & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <DollarSign size={14} className="text-green-400" />
                      Total Budget (PKR) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1000"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      placeholder="e.g. 15000"
                      className="input-field"
                    />
                    {form.budget && (
                      <p className="text-green-400 text-xs mt-1">
                        ≈ Rs. {Math.round(parseInt(form.budget || 0) / Math.max(1, parseInt(form.durationDays || 1))).toLocaleString()} / day
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Clock size={14} className="text-blue-400" />
                      Duration (Days) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={form.durationDays}
                      onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                      placeholder="e.g. 3"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Group & City & Transport */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Users size={14} className="text-purple-400" />
                      Group Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={form.groupSize}
                      onChange={(e) => setForm({ ...form, groupSize: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <MapPin size={14} className="text-red-400" />
                      Starting City
                    </label>
                    <select
                      value={form.startLocation.city}
                      onChange={(e) => setForm({ ...form, startLocation: { city: e.target.value } })}
                      className="input-field"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c} className="bg-gray-900">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Car size={14} className="text-orange-400" />
                      Transport
                    </label>
                    <select
                      value={form.transportType}
                      onChange={(e) => setForm({ ...form, transportType: e.target.value })}
                      className="input-field"
                    >
                      {TRANSPORT_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value} className="bg-gray-900">{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Stay Preference */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Home size={14} className="text-pink-400" />
                    Accommodation Preference
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {STAY_OPTIONS.map(({ value, label, price }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm({ ...form, stayPreference: value })}
                        className={`p-3 rounded-xl border text-xs transition-all text-center ${
                          form.stayPreference === value
                            ? 'bg-green-500/20 border-green-500/40 text-green-400'
                            : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20 glass'
                        }`}
                      >
                        <div className="font-medium">{label}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">{price}/night</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.budget || !form.durationDays}
                className="w-full mt-6 py-4 btn-primary rounded-xl font-bold
                           disabled:opacity-30 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                Next: Choose Interests <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ══ STEP 2 ══ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass rounded-2xl p-6 md:p-8 border border-white/8"
            >
              <h2 className="text-xl font-bold text-white mb-1">What do you enjoy?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Select your interests to get a personalised itinerary
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {INTERESTS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleInterest(id)}
                    className={`py-4 px-3 rounded-xl border text-sm font-medium transition-all duration-200 text-center ${
                      form.interests.includes(id)
                        ? 'bg-green-500/20 border-green-500/40 text-green-300 scale-[1.02]'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white glass'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {form.interests.length > 0 && (
                <p className="text-green-400 text-sm mb-4">
                  ✓ {form.interests.length} interest{form.interests.length > 1 ? 's' : ''} selected
                </p>
              )}

              {/* Summary card */}
              <div className="glass-green rounded-xl p-4 mb-6 border border-green-500/10">
                <p className="text-green-400 text-xs font-semibold mb-2 uppercase tracking-wider">Trip Summary</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-300">
                  <span>💰 Rs. {parseInt(form.budget || 0).toLocaleString()}</span>
                  <span>📅 {form.durationDays || '?'} day{parseInt(form.durationDays) > 1 ? 's' : ''}</span>
                  <span>👥 {form.groupSize} people</span>
                  <span>📍 From {form.startLocation?.city}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 glass rounded-xl text-gray-400 hover:text-white
                             transition-all font-medium flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-[2] py-4 btn-primary rounded-xl font-bold
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Planning your trip…
                    </>
                  ) : (
                    <>
                      <Zap size={16} /> Generate My Trip Plan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ══ STEP 3 ══ */}
          {step === 3 && generatedPlan && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >

              {/* Plan header card */}
              <div className="glass rounded-2xl p-6 border border-green-500/20 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-700
                                  flex items-center justify-center shadow-glow flex-shrink-0">
                    <Compass size={28} className="text-white" />
                  </div>

                  {/* Title & meta */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-white truncate">
                      {generatedPlan.title || 'Your Shangla Trip'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-400">
                      <span>👥 {form.groupSize} people</span>
                      <span>📍 From {form.startLocation?.city}</span>
                      <span>🚗 {form.transportType?.replace('_', ' ')}</span>
                      <span>🏨 {form.stayPreference}</span>
                    </div>
                  </div>

                  {/* Budget badge */}
                  <div className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 flex-shrink-0 ${
                    withinBudget
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {withinBudget ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    Rs. {planTotal.toLocaleString()}
                  </div>
                </div>

                {/* AI notes */}
                {planNotes && (
                  <div className="mt-4 p-3 glass rounded-xl text-sm text-gray-300 leading-relaxed">
                    💡 {planNotes}
                  </div>
                )}
              </div>

              {/* Day tabs + Budget tab */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {planDays.map((day, idx) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeDayIndex === idx
                        ? 'bg-green-600 text-white shadow-glow'
                        : 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    Day {day.dayNumber}
                  </button>
                ))}
                <button
                  onClick={() => setActiveDayIndex(-1)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeDayIndex === -1
                      ? 'bg-green-600 text-white shadow-glow'
                      : 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  💰 Budget
                </button>
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">

                {/* ── Day view ── */}
                {activeDayIndex >= 0 && activeDay && (
                  <motion.div
                    key={`day-${activeDayIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass rounded-2xl p-6 border border-white/8 mb-6"
                  >
                    {/* Day header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">{activeDayTitle}</h3>
                      <span className="text-green-400 font-bold text-sm bg-green-500/10
                                       border border-green-500/20 px-3 py-1 rounded-lg">
                        Rs. {activeDayTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Activity timeline */}
                    <div className="relative">
                      <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-white/5" />

                      <div className="space-y-2">
                        {activeDayActvs.map((activity, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="relative flex gap-4 py-2 group"
                          >
                            {/* Icon bubble */}
                            <div className="flex-shrink-0 z-10">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${getActivityColor(activity.type)}`}>
                                {activity.icon
                                  ? <span className="text-base leading-none">{activity.icon}</span>
                                  : getActivityIcon(activity.type)}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pb-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  {/* Time + type badge */}
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs text-gray-500 font-mono">{activity.time}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${getActivityColor(activity.type)}`}>
                                      {activity.type}
                                    </span>
                                  </div>
                                  {/* Activity name */}
                                  <p className="text-white font-medium text-sm leading-snug">
                                    {activity.activity}
                                  </p>
                                  {/* Duration */}
                                  {activity.duration && (
                                    <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                                      <Clock size={10} /> {activity.duration}
                                    </p>
                                  )}
                                  {/* Notes */}
                                  {activity.notes && (
                                    <p className="text-gray-400 text-xs mt-1 italic leading-relaxed">
                                      💡 {activity.notes}
                                    </p>
                                  )}
                                </div>

                                {/* Cost */}
                                {activity.cost > 0 && (
                                  <span className="text-green-400 text-xs font-bold flex-shrink-0
                                                   bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg">
                                    Rs. {activity.cost.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Prev / Next day navigation */}
                    <div className="flex justify-between mt-6 pt-4 border-t border-white/5">
                      <button
                        onClick={() => setActiveDayIndex(Math.max(0, activeDayIndex - 1))}
                        disabled={activeDayIndex === 0}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-white
                                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ArrowLeft size={14} /> Previous Day
                      </button>
                      <button
                        onClick={() => setActiveDayIndex(Math.min(planDays.length - 1, activeDayIndex + 1))}
                        disabled={activeDayIndex >= planDays.length - 1}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-white
                                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Next Day <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Budget view ── */}
                {activeDayIndex === -1 && (
                  <motion.div
                    key="budget"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass rounded-2xl p-6 border border-white/8 mb-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-6">💰 Cost Breakdown</h3>

                    <div className="space-y-4 mb-6">
                      {[
                        { key: 'transport',  label: '🚗 Transport',       color: 'bg-blue-500'   },
                        { key: 'food',       label: '🍽️ Food & Drinks',   color: 'bg-orange-500' },
                        { key: 'stay',       label: '🏨 Accommodation',   color: 'bg-purple-500' },
                        { key: 'activities', label: '🎯 Activities',      color: 'bg-pink-500'   },
                        { key: 'misc',       label: '📦 Miscellaneous',   color: 'bg-gray-500'   },
                      ].map(({ key, label, color }) => {
                        const amount = planCosts[key] || 0;
                        const pct    = planTotal > 0 ? Math.round((amount / planTotal) * 100) : 0;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-gray-300 text-sm">{label}</span>
                              <span className="text-white font-bold text-sm">
                                Rs. {amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className={`h-full ${color} rounded-full`}
                              />
                            </div>
                            <p className="text-gray-600 text-xs mt-0.5 text-right">{pct}%</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total box */}
                    <div className="p-5 rounded-xl border-2 border-green-500/30 bg-green-500/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-bold text-lg">Total Estimated</span>
                        <span className="text-green-400 font-black text-2xl">
                          Rs. {planTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="divider" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Your Budget</span>
                        <span className="text-gray-300">
                          Rs. {parseInt(form.budget || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Per Person</span>
                        <span className="text-gray-300">
                          Rs. {Math.round(planTotal / Math.max(1, parseInt(form.groupSize || 1))).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Per Day Average</span>
                        <span className="text-gray-300">
                          Rs. {Math.round(planTotal / Math.max(1, parseInt(form.durationDays || 1))).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Budget Status</span>
                        <span className={withinBudget ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                          {withinBudget ? '✅ Within Budget' : '⚠️ Over Budget'}
                        </span>
                      </div>
                    </div>

                    {/* Per-day breakdown */}
                    <div className="mt-6">
                      <p className="text-sm text-gray-400 font-medium mb-3">Daily Cost Breakdown</p>
                      <div className="space-y-2">
                        {planDays.map((day) => (
                          <div
                            key={day.dayNumber}
                            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 cursor-pointer hover:text-green-400 transition-colors text-sm"
                            onClick={() => setActiveDayIndex(day.dayNumber - 1)}
                          >
                            <span className="text-gray-400">{day.title}</span>
                            <span className="text-white font-semibold">
                              Rs. {(day.totalCost || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={resetPlanner}
                  className="py-3 glass rounded-xl text-gray-400 hover:text-white transition-all
                             flex items-center justify-center gap-2 text-sm font-medium
                             border border-white/10 hover:border-white/20"
                >
                  <RotateCcw size={14} /> Plan Again
                </button>
                <button
                  onClick={handleDownload}
                  className="py-3 glass rounded-xl text-blue-400 hover:text-blue-300 transition-all
                             flex items-center justify-center gap-2 text-sm font-medium
                             border border-blue-500/20 hover:border-blue-500/40"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={handleShare}
                  className="py-3 glass rounded-xl text-purple-400 hover:text-purple-300 transition-all
                             flex items-center justify-center gap-2 text-sm font-medium
                             border border-purple-500/20 hover:border-purple-500/40"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  onClick={() => {
                    const firstVisit = planDays?.[0]?.activities?.find((a) => a.type === 'visit');
                    const query = firstVisit?.placeName
                      ? `${firstVisit.placeName} Shangla Pakistan`
                      : 'Shangla Top Pakistan';
                    window.open(
                      `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
                      '_blank'
                    );
                  }}
                  className="py-3 btn-primary rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Navigation size={14} /> View Map
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TripPlannerPage;
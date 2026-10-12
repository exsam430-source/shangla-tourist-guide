export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
};

export const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getWeatherIcon = (description) => {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('clear')) return '☀️';
  if (desc.includes('cloud')) return '☁️';
  if (desc.includes('rain')) return '🌧️';
  if (desc.includes('snow')) return '❄️';
  if (desc.includes('storm') || desc.includes('thunder')) return '⛈️';
  if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
  if (desc.includes('wind')) return '💨';
  return '🌤️';
};

export const getAlertColor = (severity) => {
  const colors = {
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
  };
  return colors[severity] || colors.yellow;
};

export const getDifficultyColor = (level) => {
  const colors = {
    easy: 'text-green-400 bg-green-500/10',
    moderate: 'text-yellow-400 bg-yellow-500/10',
    hard: 'text-orange-400 bg-orange-500/10',
    expert: 'text-red-400 bg-red-500/10',
  };
  return colors[level] || colors.easy;
};

export const getCategoryIcon = (category) => {
  const icons = {
    viewpoint: '👁️',
    mountain: '🏔️',
    valley: '🏞️',
    waterfall: '💧',
    lake: '🏊',
    historical: '🏛️',
    religious: '🕌',
    forest: '🌲',
    village: '🏘️',
    scenic: '🌄',
    adventure: '🧗',
    camping: '⛺',
    photography: '📸',
    trekking: '🥾',
    cultural: '🎭',
  };
  return icons[category] || '📍';
};

export const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export const clsx = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
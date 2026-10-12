import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Wind, Droplets, Eye, Sun, Cloud } from 'lucide-react';
import api from '@/utils/api';
import { getWeatherIcon } from '@/utils/helpers';

// Default Shangla Top coordinates
const SHANGLA_TOP = { lat: 34.87, lng: 72.60, name: 'Shangla Top' };

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { data } = await api.get('/weather/coordinates', {
          params: {
            lat: SHANGLA_TOP.lat,
            lng: SHANGLA_TOP.lng,
            placeName: SHANGLA_TOP.name,
          },
        });
        setWeather(data.data);
      } catch {
        // Silently fail — weather is not critical
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/8 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-12 bg-white/10 rounded w-1/2 mb-3" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/8 text-center">
        <p className="text-gray-500 text-sm">Weather data unavailable</p>
        <p className="text-gray-600 text-xs mt-1">Add OpenWeatherMap API key</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 border border-white/8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Live Weather</p>
          <h3 className="text-white font-bold">{weather.placeName}</h3>
        </div>
        <span className="text-3xl">{getWeatherIcon(weather.current?.description)}</span>
      </div>

      {/* Current Temp */}
      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-black text-white">{weather.current?.temp}°</span>
        <div className="mb-2">
          <p className="text-gray-300 text-sm capitalize">{weather.current?.description}</p>
          <p className="text-gray-500 text-xs">Feels like {weather.current?.feelsLike}°C</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: Droplets, label: 'Humidity', value: `${weather.current?.humidity}%`, color: 'text-blue-400' },
          { icon: Wind, label: 'Wind', value: `${weather.current?.windSpeed} m/s`, color: 'text-cyan-400' },
          { icon: Eye, label: 'Visibility', value: `${weather.current?.visibility} km`, color: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="text-center">
            <Icon size={14} className={`${color} mx-auto mb-1`} />
            <p className="text-white text-sm font-semibold">{value}</p>
            <p className="text-gray-600 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Sun Times */}
      {weather.sunrise && (
        <div className="flex justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
          <span>🌅 Sunrise: {weather.sunrise}</span>
          <span>🌇 Sunset: {weather.sunset}</span>
        </div>
      )}

      {/* 5-Day Forecast */}
      {weather.forecast?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">5-Day Forecast</p>
          <div className="grid grid-cols-5 gap-1">
            {weather.forecast.slice(0, 5).map((day, i) => (
              <div key={i} className="text-center">
                <p className="text-gray-500 text-xs mb-1">
                  {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </p>
                <img src={day.icon} alt={day.description} className="w-7 h-7 mx-auto" />
                <p className="text-white text-xs font-semibold mt-1">{day.maxTemp}°</p>
                <p className="text-gray-600 text-xs">{day.minTemp}°</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WeatherWidget;
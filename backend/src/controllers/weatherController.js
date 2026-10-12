const axios = require('axios');
const Place = require('../models/Place');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const fetchWeather = async (lat, lng) => {
  const response = await axios.get(
    'https://api.openweathermap.org/data/2.5/forecast',
    {
      params: {
        lat,
        lon: lng,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric',
        cnt: 40,
      },
      timeout: 8000,
    }
  );
  return response.data;
};

const formatWeatherData = (data, placeName) => {
  const current = data.list[0];
  const days = {};

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!days[date]) {
      days[date] = {
        date,
        temps: [],
        descriptions: [],
        icons: [],
        humidity: [],
        windSpeed: [],
        rainChance: [],
      };
    }
    days[date].temps.push(item.main.temp);
    days[date].descriptions.push(item.weather[0].description);
    days[date].icons.push(item.weather[0].icon);
    days[date].humidity.push(item.main.humidity);
    days[date].windSpeed.push(item.wind.speed);
    days[date].rainChance.push(item.pop || 0);
  });

  const forecast = Object.values(days)
    .slice(0, 5)
    .map((day) => ({
      date: day.date,
      maxTemp: Math.round(Math.max(...day.temps)),
      minTemp: Math.round(Math.min(...day.temps)),
      description: day.descriptions[0],
      icon: `https://openweathermap.org/img/wn/${day.icons[0]}@2x.png`,
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
      rainChance: Math.round(Math.max(...day.rainChance) * 100),
    }));

  return {
    placeName,
    current: {
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      description: current.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
      visibility: (current.visibility || 0) / 1000,
      pressure: current.main.pressure,
    },
    forecast,
    sunrise: new Date(data.city.sunrise * 1000).toLocaleTimeString(),
    sunset: new Date(data.city.sunset * 1000).toLocaleTimeString(),
    lastUpdated: new Date().toISOString(),
  };
};

const getPlaceWeather = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.placeId).select('nameEn coordinates');

  if (!place) {
    return errorResponse(res, 404, 'Place not found');
  }

  if (!process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY === 'your_openweather_key') {
    return errorResponse(res, 503, 'Weather API key not configured');
  }

  try {
    const weatherData = await fetchWeather(place.coordinates.lat, place.coordinates.lng);
    const formatted = formatWeatherData(weatherData, place.nameEn);
    return successResponse(res, 200, 'Weather data fetched', formatted);
  } catch (error) {
    return errorResponse(res, 503, 'Weather service temporarily unavailable');
  }
});

const getWeatherByCoordinates = asyncHandler(async (req, res) => {
  const { lat, lng, placeName = 'Shangla' } = req.query;

  if (!lat || !lng) {
    return errorResponse(res, 400, 'Latitude and longitude are required');
  }

  if (!process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY === 'your_openweather_key') {
    return errorResponse(res, 503, 'Weather API key not configured. Add OPENWEATHER_API_KEY to .env');
  }

  try {
    const weatherData = await fetchWeather(parseFloat(lat), parseFloat(lng));
    const formatted = formatWeatherData(weatherData, placeName);
    return successResponse(res, 200, 'Weather data fetched', formatted);
  } catch (error) {
    return errorResponse(res, 503, 'Weather service temporarily unavailable');
  }
});

const getAllPlacesWeather = asyncHandler(async (req, res) => {
  const places = await Place.find({ isFeatured: true, isActive: true })
    .select('nameEn coordinates')
    .limit(10);

  if (!process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY === 'your_openweather_key') {
    return successResponse(res, 200, 'Weather API key not configured', []);
  }

  const weatherPromises = places.map(async (place) => {
    try {
      const data = await fetchWeather(place.coordinates.lat, place.coordinates.lng);
      const current = data.list[0];
      return {
        placeId: place._id,
        placeName: place.nameEn,
        temp: Math.round(current.main.temp),
        description: current.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
        humidity: current.main.humidity,
      };
    } catch {
      return { placeId: place._id, placeName: place.nameEn, error: true };
    }
  });

  const results = (await Promise.allSettled(weatherPromises))
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  return successResponse(res, 200, 'All weather data fetched', results);
});

module.exports = { getPlaceWeather, getWeatherByCoordinates, getAllPlacesWeather };
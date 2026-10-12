const express = require('express');
const router = express.Router();
const { getPlaceWeather, getWeatherByCoordinates, getAllPlacesWeather } = require('../controllers/weatherController');

router.get('/all', getAllPlacesWeather);
router.get('/coordinates', getWeatherByCoordinates);
router.get('/:placeId', getPlaceWeather);

module.exports = router;